import { Upload, File, X, CheckCircle, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';


const MAX_SIZE_MB = 50;

const UploadCard = ({ onUploadSuccess }) => {
  const { isSignedIn, user } = useUser();
  const queryClient = useQueryClient();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]); // Array of { file, id, status }
  const [uploading, setUploading] = useState(false);
  const [overallStatus, setOverallStatus] = useState('idle'); // idle | uploading | success | error

  const addFiles = (newFiles) => {
    if (!newFiles || newFiles.length === 0) return;
    
    const validFiles = [];
    const rejectedFiles = [];

    Array.from(newFiles).forEach(file => {
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > MAX_SIZE_MB) {
        rejectedFiles.push(file.name);
      } else {
        validFiles.push({
          file,
          id: Math.random().toString(36).substr(2, 9),
          status: 'idle'
        });
      }
    });

    if (rejectedFiles.length > 0) {
      toast.error(`${rejectedFiles.length} file(s) too large`, {
        description: `Max ${MAX_SIZE_MB}MB allowed. Rejected: ${rejectedFiles.join(', ')}`,
      });
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      toast.info(`Added ${validFiles.length} file(s)`);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files) addFiles(e.target.files);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (files.length === 1) setOverallStatus('idle');
  };

  const handleUpload = async () => {
    if (files.length === 0 || !isSignedIn) return;

    setUploading(true);
    setOverallStatus('uploading');
    const totalFiles = files.length;
    let completedCount = 0;

    const API_URL = import.meta.env.VITE_API_URL;
    if (!API_URL) {
      toast.error("API URL not configured");
      setUploading(false);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const currentFile = files[i];
      if (currentFile.status === 'success') {
        completedCount++;
        continue;
      }

      // Update status to uploading
      setFiles(prev => prev.map(f => f.id === currentFile.id ? { ...f, status: 'uploading' } : f));

      try {
        // 1. Get Presigned URL
        const response = await fetch(`${API_URL}/upload?fileName=${encodeURIComponent(currentFile.file.name)}&userId=${user.id}`);
        if (!response.ok) throw new Error('Auth failed');
        
        const { url, fields } = await response.json();

        // 2. Upload to S3
        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
        formData.append('file', currentFile.file);

        const s3Response = await fetch(url, { method: 'POST', body: formData });
        if (!s3Response.ok) throw new Error('S3 error');

        setFiles(prev => prev.map(f => f.id === currentFile.id ? { ...f, status: 'success' } : f));
        completedCount++;
      } catch (err) {
        console.error(`Upload error for ${currentFile.file.name}:`, err);
        setFiles(prev => prev.map(f => f.id === currentFile.id ? { ...f, status: 'error' } : f));
      }
    }

    setUploading(false);
    if (completedCount === totalFiles) {
      setOverallStatus('success');
      toast.success('All files uploaded successfully!');
      
      // Invalidate cache so My Files is up to date immediately
      queryClient.invalidateQueries({ queryKey: ['files', user?.id] });
      
      if (onUploadSuccess) onUploadSuccess();
      
      setTimeout(() => {
        setFiles([]);
        setOverallStatus('idle');
      }, 2000);
    } else {
      setOverallStatus('error');
      toast.error(`${totalFiles - completedCount} file(s) failed to upload`);
    }
  };

  // ---- Signed-out state ----
  if (!isSignedIn) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto px-4 sm:px-6 mb-20 mt-10"
      >
        <div className="glass-card flex flex-col items-center justify-center py-14 gap-4 text-center">
          <div className="bg-white/5 p-5 rounded-full">
            <Lock className="w-8 h-8 text-[#0ea5e9]" />
          </div>
          <h3 className="text-lg font-bold text-white">Sign in to upload</h3>
          <p className="text-sm text-slate-400 max-w-xs">
            Create a free account to securely upload, share, and manage your files from anywhere.
          </p>
        </div>
      </motion.div>
    );
  }

  const overallProgress = files.length > 0 
    ? (files.filter(f => f.status === 'success').length / files.length) * 100 
    : 0;

  // ---- Signed-in state ----
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto px-4 sm:px-6 w-full" 
      id="upload"
    >
      <div className="glass-card relative overflow-hidden">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white">Upload Files</h2>
          <p className="text-sm text-slate-400 mt-1">
            Files are stored privately · Max {MAX_SIZE_MB}MB per file
          </p>
        </div>

        <div className="flex flex-col space-y-5">
          {/* Drop Zone */}
          <motion.div
            whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.05)' }}
            whileTap={{ scale: 0.99 }}
            className={`relative w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer p-8
              ${dragActive
                ? 'border-[#0ea5e9] bg-[rgba(14,165,233,0.08)]'
                : 'border-white/10 hover:border-white/25'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="bg-white/5 p-4 rounded-full mb-3">
              <Upload className={`w-7 h-7 text-[#0ea5e9] ${dragActive ? 'animate-bounce' : ''}`} />
            </div>
            <p className="text-sm font-medium text-slate-300 mb-1 text-center">
              Drag & drop or <span className="text-[#0ea5e9]">browse</span> to add files
            </p>
            <p className="text-xs text-slate-500">Multiple files supported · Max {MAX_SIZE_MB}MB each</p>
            <input
              type="file"
              multiple
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleChange}
              disabled={uploading}
            />
          </motion.div>

          {/* File List / Previews */}
          <AnimatePresence mode="popLayout">
            {files.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="max-h-[320px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                  <AnimatePresence initial={false}>
                    {files.map((fileObj) => (
                      <motion.div 
                        key={fileObj.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        layout
                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 group shadow-sm hover:border-white/20 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`shrink-0 p-2 rounded-lg transition-colors ${
                            fileObj.status === 'success' ? 'bg-emerald-500/10' : 
                            fileObj.status === 'error' ? 'bg-red-500/10' : 'bg-white/5'
                          }`}>
                            {fileObj.status === 'uploading' ? (
                              <Loader2 className="w-4 h-4 text-[#0ea5e9] animate-spin" />
                            ) : fileObj.status === 'success' ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <File className={`w-4 h-4 ${fileObj.status === 'error' ? 'text-red-500' : 'text-slate-400'}`} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{fileObj.file.name}</p>
                            <p className="text-[10px] font-medium text-slate-500">{(fileObj.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                        
                        {!uploading && fileObj.status !== 'success' && (
                          <button
                            onClick={() => removeFile(fileObj.id)}
                            className="shrink-0 p-1.5 hover:bg-red-500/10 rounded-full transition-colors text-slate-500 hover:text-red-500"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Progress Summary */}
                {uploading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2 glass p-4 rounded-xl border border-white/10"
                  >
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                      <span>Batch Uploading</span>
                      <span>{Math.round(overallProgress)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${overallProgress}%` }}
                        style={{ background: 'linear-gradient(to right, #0ea5e9, #8b5cf6)' }}
                        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Action Button */}
                <motion.button
                  layout
                  onClick={handleUpload}
                  whileTap={{ scale: 0.98 }}
                  disabled={uploading || overallStatus === 'success'}
                  className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg
                    ${overallStatus === 'success'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 cursor-default'
                      : 'btn-primary'}`}
                >
                  {uploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Processing Batch...</>
                  ) : overallStatus === 'success' ? (
                    <motion.div 
                      className="flex items-center gap-2"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                    >
                      <CheckCircle className="w-4 h-4" />Batch Uploaded
                    </motion.div>
                  ) : (
                    `Upload ${files.length} File${files.length > 1 ? 's' : ''}`
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default UploadCard;
