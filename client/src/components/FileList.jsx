import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { 
  FileText, 
  Download, 
  Trash2, 
  RefreshCw, 
  HardDrive, 
  Calendar, 
  MoreVertical,
  Loader2,
  AlertCircle,
  Share2,
  Globe,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

const FileList = ({ refreshTrigger }) => {
  const { isSignedIn, user } = useUser();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null); // File name being processed

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchFiles = useCallback(async () => {
    if (!isSignedIn || !user) return;
    
    setLoading(true);
    setError(null);
    try {
      if (!API_URL) throw new Error("API URL not configured in .env");

      const response = await fetch(`${API_URL}/files?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch files');
      
      const data = await response.json();
      // Sort by last modified date (newest first)
      const sortedFiles = (data.files || []).sort((a, b) => 
        new Date(b.lastModified) - new Date(a.lastModified)
      );
      setFiles(sortedFiles);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      toast.error('Could not load files');
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, user, API_URL]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, refreshTrigger]);

  const handleDownload = async (file) => {
    setActionInProgress(file.name);
    const toastId = toast.loading(`Generating link for ${file.name}...`);
    
    try {
      // Use the key returned by S3 List
      const response = await fetch(`${API_URL}/download?key=${encodeURIComponent(file.key)}`);
      if (!response.ok) throw new Error('Download failed');
      
      const { url } = await response.json();
      window.open(url, '_blank');
      toast.success('Download started', { id: toastId });
    } catch (err) {
      toast.error('Download failed', { id: toastId });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`Are you sure you want to delete ${file.name}?`)) return;
    
    setActionInProgress(file.name);
    const toastId = toast.loading(`Deleting ${file.name}...`);
    
    try {
      const response = await fetch(`${API_URL}/files?key=${encodeURIComponent(file.key)}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Delete failed');
      
      toast.success('File removed', { id: toastId });
      setFiles(prev => prev.filter(f => f.key !== file.key));
    } catch (err) {
      toast.error('Delete failed', { id: toastId });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleTogglePublic = async (file) => {
    const action = file.isPublic ? 'unshare' : 'share';
    setActionInProgress(file.name);
    const toastId = toast.loading(`${action === 'share' ? 'Sharing' : 'Unsharing'} ${file.name}...`);

    try {
      const response = await fetch(`${API_URL}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          userId: user.id,
          action: action
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      toast.success(`File ${action}d!`, { id: toastId });
      fetchFiles(); 
    } catch (err) {
      console.error('Toggle Public Error:', err);
      toast.error(`Could not toggle status: ${err.message}`, { id: toastId });
    } finally {
      setActionInProgress(null);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (isoStr) => {
    return new Date(isoStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading && files.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9]" />
        <p className="text-sm font-medium">Scanning your vault...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Your Files</h2>
          <p className="text-sm text-slate-400 mt-1">Manage your cloud storage assets</p>
        </div>
        <button 
          onClick={fetchFiles}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
          title="Refresh storage"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error ? (
        <div className="glass-card py-12 px-6 text-center border-red-500/20">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Connection Error</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
            We couldn't reach your AWS backend. Please check your API URL in .env.
          </p>
          <button onClick={fetchFiles} className="btn-primary px-6 py-2 text-sm">
            Try Again
          </button>
        </div>
      ) : files.length === 0 ? (
        <div className="glass-card py-20 px-6 text-center">
          <div className="bg-white/5 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <HardDrive className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No files yet</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Your personal file vault is currently empty. Start by uploading a file on the upload page.
          </p>
        </div>
      ) : (
      <div className="overflow-x-auto glass !p-0 rounded-2xl border border-white/10">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-white/10 bg-white/2">
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Name</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Visibility</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Size</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Date</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right pr-10">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {files.map((file) => (
              <tr 
                key={file.name} 
                className="group hover:bg-white/3 transition-all duration-200"
              >
                {/* Name & Icon Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-[#0ea5e9]/10 group-hover:border-[#0ea5e9]/20 transition-all duration-300">
                      <FileText className="w-5 h-5 text-[#0ea5e9]" />
                    </div>
                    <span className="text-sm font-bold text-white max-w-[200px] truncate" title={file.name}>
                      {file.name}
                    </span>
                  </div>
                </td>

                {/* Visibility Column */}
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    file.isPublic 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                      : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                  }`}>
                    {file.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {file.isPublic ? 'Public' : 'Private'}
                  </div>
                </td>

                {/* Size Column */}
                <td className="px-6 py-4">
                  <span className="text-xs font-medium text-slate-400">
                    {formatSize(file.size)}
                  </span>
                </td>

                {/* Date Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5 opacity-50" />
                    {formatDate(file.lastModified)}
                  </div>
                </td>

                {/* Actions Column */}
                <td className="px-6 py-4 text-right pr-6">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => handleTogglePublic(file)}
                      disabled={actionInProgress === file.name}
                      className={`p-2.5 rounded-xl transition-all disabled:opacity-50 border border-transparent ${
                        file.isPublic 
                          ? 'bg-amber-500/5 hover:bg-amber-500/15 text-amber-500/70 hover:text-amber-500 hover:border-amber-500/20' 
                          : 'bg-[#0ea5e9]/5 hover:bg-[#0ea5e9]/15 text-[#0ea5e9]/70 hover:text-[#0ea5e9] hover:border-[#0ea5e9]/20'
                      }`}
                      title={file.isPublic ? "Make Private" : "Share with everyone"}
                    >
                      {actionInProgress === file.name ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDownload(file)}
                      disabled={actionInProgress === file.name}
                      className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-all disabled:opacity-50 border border-transparent hover:border-white/10"
                      title="Download file"
                    >
                      {actionInProgress === file.name ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      disabled={actionInProgress === file.name}
                      className="p-2.5 bg-red-500/5 hover:bg-red-500/15 text-red-500/70 hover:text-red-500 rounded-xl transition-all disabled:opacity-50 border border-transparent hover:border-red-500/20"
                      title="Delete file"
                    >
                      {actionInProgress === file.name ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
};

export default FileList;
