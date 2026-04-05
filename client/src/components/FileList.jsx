import React, { useEffect, useState, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Download,
  Trash2,
  RefreshCw,
  HardDrive,
  Calendar,
  Loader2,
  AlertCircle,
  Share2,
  Globe,
  Lock,
  Search,
  XCircle,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from './CustomSelect';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
};

const FileList = ({ refreshTrigger }) => {
  const { isSignedIn, user } = useUser();
  const queryClient = useQueryClient();
  const [actionInProgress, setActionInProgress] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [visibilityFilter, setVisibilityFilter] = useState('All');

  const API_URL = import.meta.env.VITE_API_URL;

  // React Query for automated fetching and caching
  const {
    data: files = [],
    isLoading,
    isError,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['files', user?.id],
    queryFn: async () => {
      if (!API_URL) throw new Error("API URL not configured");
      const response = await fetch(`${API_URL}/files?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      return (data.files || []).sort((a, b) =>
        new Date(b.lastModified) - new Date(a.lastModified)
      );
    },
    enabled: !!isSignedIn && !!user && !!API_URL,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      // Search Filter
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Visibility Filter
      if (visibilityFilter === 'Public' && !file.isPublic) return false;
      if (visibilityFilter === 'Private' && file.isPublic) return false;

      // Category Filter
      if (activeFilter === 'All') return true;

      const ext = file.name.split('.').pop()?.toLowerCase();
      
      if (activeFilter === 'Images') {
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
      }
      if (activeFilter === 'Documents') {
        return ['pdf', 'doc', 'docx', 'txt', 'csv', 'xls', 'xlsx'].includes(ext);
      }
      if (activeFilter === 'Others') {
        const isImg = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
        const isDoc = ['pdf', 'doc', 'docx', 'txt', 'csv', 'xls', 'xlsx'].includes(ext);
        return !isImg && !isDoc;
      }
      return true;
    });
  }, [files, searchQuery, activeFilter, visibilityFilter]);

  const handleDownload = async (file) => {
    setActionInProgress(file.name);
    const toastId = toast.loading(`Generating link for ${file.name}...`);

    try {
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
      // Invalidate the query to refresh the list in background
      queryClient.invalidateQueries({ queryKey: ['files', user.id] });
      queryClient.invalidateQueries({ queryKey: ['public-files'] });
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

      if (!response.ok) throw new Error('Action failed');

      toast.success(`File ${action}d!`, { id: toastId });
      // Invalidate the queries to sync across My Files and Public Feed
      queryClient.invalidateQueries({ queryKey: ['files', user.id] });
      queryClient.invalidateQueries({ queryKey: ['public-files'] });
    } catch (err) {
      toast.error(`Could not toggle status: ${err.message}`, { id: toastId });
    } finally {
      setActionInProgress(null);
    }
  };

  const visibilityOptions = [
    { label: 'All Files', value: 'All', icon: Eye },
    { label: 'Public Only', value: 'Public', icon: Globe },
    { label: 'Private Only', value: 'Private', icon: Lock },
  ];

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

  if (isLoading && files.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9]" />
        <p className="text-sm font-medium">Scanning your vault...</p>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 pb-12 pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Your Files</h2>
          <p className="text-sm text-slate-400 mt-1">Manage your cloud storage assets</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white border border-white/5 bg-white/2"
            title="Refresh storage"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Enhanced Toolbar: Search, Categories, Visibility */}
      <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
        {/* 1. Compact Search Bar */}
        <div className="relative w-full lg:max-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search filenames..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/50 transition-all h-10"
          />
        </div>

        {/* 2. Category Filters (Flexible) */}
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10 overflow-x-auto no-scrollbar flex-grow w-full lg:w-auto h-10">
          {['All', 'Images', 'Documents', 'Others'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-1 sm:flex-initial px-4 h-full rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* 3. Visibility Selector */}
        <CustomSelect 
          value={visibilityFilter}
          onChange={setVisibilityFilter}
          options={visibilityOptions}
          label="Visibility"
        />
      </div>

      {isError ? (
        <div className="glass-card py-12 px-6 text-center border-red-500/20">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Connection Error</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
            We couldn't reach your AWS backend. Please check your config.
          </p>
          <button onClick={() => refetch()} className="btn-primary px-6 py-2 text-sm">
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
            Your personal file vault is currently empty. Start by uploading a file.
          </p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="glass-card py-20 px-6 text-center border-dashed">
          <div className="bg-white/5 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No matches found</h3>
          <button
            onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
            className="text-xs font-bold text-[#0ea5e9] hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto glass !p-0 rounded-2xl border border-white/10 mb-5 animate-in fade-in duration-500 shadow-2xl">
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
            <motion.tbody
              className="divide-y divide-white/5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {filteredFiles.map((file) => (
                  <motion.tr
                    key={file.name}
                    variants={itemVariants}
                    layout
                    className="group transition-all duration-200"
                  >
                    {/* Name & Icon Column */}
                    <td className="px-6 py-4 text-sm font-bold text-white">
                      <div className="flex items-center gap-3">
                        <div className="shrink-0 bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-[#0ea5e9]/10 transition-all">
                          <FileText className="w-5 h-5 text-[#0ea5e9]" />
                        </div>
                        <span className="max-w-[200px] truncate" title={file.name}>{file.name}</span>
                      </div>
                    </td>

                    {/* Visibility Column */}
                    <td className="px-6 py-4 text-xs font-bold">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${file.isPublic
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                        }`}>
                        {file.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {file.isPublic ? 'Public' : 'Private'}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs font-medium text-slate-400">
                      {formatSize(file.size)}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 opacity-50" />
                        {formatDate(file.lastModified)}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right pr-10">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleTogglePublic(file)}
                          disabled={actionInProgress === file.name}
                          className={`p-2.5 rounded-xl transition-all ${file.isPublic
                            ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                            : 'bg-[#0ea5e9]/10 text-[#0ea5e9] hover:bg-[#0ea5e9]/20'
                            }`}
                          title={file.isPublic ? "Make Private" : "Make Public"}
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
                          className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 transition-all"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file)}
                          disabled={actionInProgress === file.name}
                          className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FileList;
