import React, { useEffect, useState, useCallback } from 'react';
import { 
  FileText, 
  Download, 
  RefreshCw, 
  Globe, 
  Calendar, 
  Loader2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

const PublicFeed = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchPublicFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!API_URL) throw new Error("API URL not configured");

      const response = await fetch(`${API_URL}/public`);
      if (!response.ok) throw new Error('Failed to fetch public files');
      
      const data = await response.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchPublicFiles();
  }, [fetchPublicFiles]);

  const handleDownload = async (file) => {
    setDownloading(file.key);
    const toastId = toast.loading(`Downloading ${file.name}...`);
    
    try {
      const response = await fetch(`${API_URL}/download?key=${encodeURIComponent(file.key)}`);
      if (!response.ok) throw new Error('Download failed');
      
      const { url } = await response.json();
      window.open(url, '_blank');
      toast.success('Download started', { id: toastId });
    } catch (err) {
      toast.error('Download failed', { id: toastId });
    } finally {
      setDownloading(null);
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
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  if (loading && files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9] mb-4" />
        <p>Exploring the global feed...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5 text-[#0ea5e9]" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Public Feed</h2>
          </div>
          <p className="text-sm text-slate-400">Discover and download files shared by the community</p>
        </div>
        <button onClick={fetchPublicFiles} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white">
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error ? (
        <div className="glass py-12 px-6 text-center border-red-500/20 rounded-2xl">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Connection Error</h3>
          <p className="text-slate-400 text-sm mb-6">Could not load the public feed.</p>
          <button onClick={fetchPublicFiles} className="btn-primary px-6 py-2 text-sm">Try Again</button>
        </div>
      ) : files.length === 0 ? (
        <div className="glass py-20 px-6 text-center rounded-2xl">
          <Globe className="w-12 h-12 text-slate-600 mx-auto mb-6 opacity-20" />
          <h3 className="text-xl font-bold text-white mb-2">The feed is silent</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">No one has shared anything public yet. Be the first to share a file from your private vault!</p>
        </div>
      ) : (
        <div className="overflow-x-auto glass !p-0 rounded-2xl border border-white/10">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/2">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Resource</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Shared By</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Size</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right pr-10">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {files.map((file) => (
                <tr key={file.key} className="group hover:bg-white/3 transition-all duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-[#0ea5e9]/10 group-hover:border-[#0ea5e9]/20 transition-all">
                        <FileText className="w-5 h-5 text-[#0ea5e9]" />
                      </div>
                      <span className="text-sm font-bold text-white max-w-[250px] truncate" title={file.name}>{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-400 italic">User_{file.uploader.substring(5, 10)}...</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-medium">{formatSize(file.size)}</td>
                  <td className="px-6 py-4 text-right pr-6">
                    <button
                      onClick={() => handleDownload(file)}
                      disabled={downloading === file.key}
                      className="p-2.5 bg-white/5 hover:bg-[#0ea5e9]/20 rounded-xl text-[#0ea5e9] transition-all disabled:opacity-50 border border-transparent hover:border-[#0ea5e9]/30"
                    >
                      {downloading === file.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    </button>
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

export default PublicFeed;
