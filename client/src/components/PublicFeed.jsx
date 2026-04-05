import React, { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Download,
  RefreshCw,
  Globe,
  Loader2,
  AlertCircle,
  Copy,
  FileCode,
  FileImage,
  File as FileIcon,
  Search,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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

const PublicFeed = () => {
  const [downloading, setDownloading] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const API_URL = import.meta.env.VITE_API_URL;

  // React Query for Explore Feed
  const {
    data: files = [],
    isLoading,
    isError,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['public-files'],
    queryFn: async () => {
      if (!API_URL) throw new Error("API URL not configured");
      const response = await fetch(`${API_URL}/public`);
      if (!response.ok) throw new Error('Failed to fetch public files');
      const data = await response.json();
      return data.files || [];
    },
    enabled: !!API_URL,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  });

  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
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
  }, [files, searchQuery, activeFilter]);

  const handleDownload = async (file) => {
    setDownloading(file.key);
    const toastId = toast.loading(`Preparing ${file.name}...`);

    try {
      const response = await fetch(`${API_URL}/download?key=${encodeURIComponent(file.key)}`);
      if (!response.ok) throw new Error('Download failed');

      const { url } = await response.json();
      window.open(url, '_blank');
      toast.success('Download started!', { id: toastId });
    } catch (err) {
      toast.error('Download failed', { id: toastId });
    } finally {
      setDownloading(null);
    }
  };

  const handleCopyLink = (file) => {
    const shareUrl = `${window.location.origin}/share/${file.key.split('/').pop()}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Public link copied to clipboard!');
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return <FileImage className="w-5 h-5 text-pink-400" />;
    if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py'].includes(ext)) return <FileCode className="w-5 h-5 text-amber-400" />;
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return <FileText className="w-5 h-5 text-blue-400" />;
    return <FileIcon className="w-5 h-5 text-slate-400" />;
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading && files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-[#0ea5e9] mb-6" />
        <h3 className="text-lg font-medium text-white italic">Scanning the ether...</h3>
        <p className="text-sm mt-2 opacity-60">Gathering community shares</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4 sm:px-6 pb-20 pt-8 animate-in fade-in duration-500 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-2.5 bg-[#0ea5e9]/10 rounded-2xl border border-[#0ea5e9]/20">
              <Globe className="w-6 h-6 text-[#0ea5e9]" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Public Discovery</h2>
          </motion.div>
          <p className="text-slate-400 max-w-lg text-sm ml-14">
            Browse assets shared by the CloudShare community.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="group flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 text-slate-300 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 transition-transform group-hover:rotate-180 duration-500 ${isRefetching ? 'animate-spin' : ''}`} />
          <span className="text-xs font-bold uppercase tracking-wider">Sync Feed</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/3 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 p-1 bg-white/3 rounded-xl border border-white/10 shrink-0 overflow-x-auto no-scrollbar">
          {['All', 'Images', 'Documents', 'Others'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeFilter === filter
                  ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20'
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {isError ? (
        <div className="glass-card py-16 px-10 text-center border-red-500/20 rounded-3xl">
          <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Network Interruption</h3>
          <button onClick={() => refetch()} className="btn-primary px-8 py-3 rounded-2xl text-sm font-bold">
            Reconnect Now
          </button>
        </div>
      ) : files.length === 0 ? (
        <div className="glass-card py-24 px-10 text-center rounded-3xl border-dashed">
          <Globe className="w-10 h-10 text-slate-500 mx-auto mb-6 opacity-30" />
          <h3 className="text-xl font-bold text-white mb-3">Waitlist for Shares</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8">No community files shared yet.</p>
          <button onClick={() => window.location.href = '/my-files'} className="text-[#0ea5e9] font-bold text-sm flex items-center gap-2 mx-auto hover:underline">
            Go to My Files <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="glass-card py-24 px-10 text-center rounded-3xl">
          <XCircle className="w-10 h-10 text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">No matches found</h3>
        </div>
      ) : (
        <div className="overflow-x-auto glass !p-0 rounded-2xl border border-white/10 mb-20 shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/2">
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">Asset</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">Size</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">Uploader</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 text-right pr-10">Actions</th>
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
                    key={file.key}
                    variants={itemVariants}
                    layout
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}
                    className="group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="shrink-0 bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-[#0ea5e9]/10 group-hover:border-[#0ea5e9]/20 transition-all">
                          {getFileIcon(file.name)}
                        </div>
                        <span className="text-sm font-bold text-white truncate max-w-[200px]">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-400">
                      {formatSize(file.size)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-medium text-slate-500 italic">User_{file.uploader.substring(5, 12)}</span>
                    </td>
                    <td className="px-6 py-4 text-right pr-10">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => handleCopyLink(file)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDownload(file)} disabled={downloading === file.key} className="p-2.5 bg-[#0ea5e9]/10 hover:bg-[#0ea5e9]/20 rounded-xl text-[#0ea5e9] transition-all">
                          {downloading === file.key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
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

export default PublicFeed;
