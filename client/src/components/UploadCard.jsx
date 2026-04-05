import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Upload, File, X, CheckCircle, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';


const MAX_SIZE_MB = 50;

const UploadCard = ({ onUploadSuccess }) => {
  const { isSignedIn, user } = useUser();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    const sizeMB = selectedFile.size / (1024 * 1024);
    if (sizeMB > MAX_SIZE_MB) {
      toast.error('File too large', {
        description: `Max ${MAX_SIZE_MB}MB allowed. Your file is ${sizeMB.toFixed(1)}MB.`,
      });
      return;
    }
    setFile(selectedFile);
    toast.info(`File selected: ${selectedFile.name}`);
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
    if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
  };

  const handleRemove = () => {
    setFile(null);
    setStatus('idle');
    toast.info('File removed');
  };

  const handleUpload = async () => {
    if (!file || !isSignedIn) return;

    setUploading(true);
    setStatus('uploading');
    const toastId = toast.loading(`Requesting upload permission...`);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      if (!API_URL) throw new Error("API URL not configured in .env.local");

      // 1. Get Presigned URL from Lambda
      const response = await fetch(`${API_URL}/upload?fileName=${encodeURIComponent(file.name)}&userId=${user.id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData || 'Failed to get upload signature');
      }

      const { url, fields } = await response.json();
      toast.loading(`Uploading to S3...`, { id: toastId });

      // 2. Upload file directly to S3
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', file);

      const s3Response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!s3Response.ok) {
        throw new Error('S3 upload failed. Check CORS settings or file size.');
      }

      setUploading(false);
      setStatus('success');
      toast.success('File uploaded successfully!', {
        id: toastId,
        description: `${file.name} is now stored in your account.`,
      });

      // Notify parent to refresh list
      if (onUploadSuccess) onUploadSuccess();

      setTimeout(() => {
        setFile(null);
        setStatus('idle');
      }, 3000);

    } catch (err) {
      console.error('Upload error:', err);
      setUploading(false);
      setStatus('error');
      toast.error('Upload failed', {
        id: toastId,
        description: err.message || 'An unexpected error occurred.',
      });
    }
  };

  // ---- Signed-out state ----
  if (!isSignedIn) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 mb-20 mt-10">
        <div className="glass-card flex flex-col items-center justify-center py-14 gap-4 text-center">
          <div className="bg-white/5 p-5 rounded-full">
            <Lock className="w-8 h-8 text-[#0ea5e9]" />
          </div>
          <h3 className="text-lg font-bold text-white">Sign in to upload</h3>
          <p className="text-sm text-slate-400 max-w-xs">
            Create a free account to securely upload, share, and manage your files from anywhere.
          </p>
        </div>
      </div>
    );
  }

  // ---- Signed-in state ----
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 mb-20 mt-10" id="upload">
      <div className="glass-card relative overflow-hidden">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white">Upload a File</h2>
          <p className="text-sm text-slate-400 mt-1">
            Files are stored privately under your account · Max {MAX_SIZE_MB}MB
          </p>
        </div>

        <div className="flex flex-col space-y-5">
          {/* Drop Zone */}
          {!file && (
            <div
              className={`relative w-full h-48 sm:h-60 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer
                ${dragActive
                  ? 'border-[#0ea5e9] bg-[rgba(14,165,233,0.08)]'
                  : 'border-white/10 hover:border-white/25 hover:bg-white/3'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="bg-white/5 p-4 rounded-full mb-3">
                <Upload className="w-7 h-7 text-[#0ea5e9]" />
              </div>
              <p className="text-sm font-medium text-slate-300 mb-1">
                Drag & drop or <span className="text-[#0ea5e9]">browse</span>
              </p>
              <p className="text-xs text-slate-500">Any file type · Max {MAX_SIZE_MB}MB</p>
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleChange}
              />
            </div>
          )}

          {/* File Preview */}
          {file && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0 p-2 bg-[rgba(14,165,233,0.15)] rounded-lg">
                    <File className="w-5 h-5 text-[#0ea5e9]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                {!uploading && status !== 'success' && (
                  <button
                    onClick={handleRemove}
                    className="shrink-0 ml-3 p-1.5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {status === 'success' && <CheckCircle className="shrink-0 ml-3 w-5 h-5 text-green-500" />}
              </div>

              {/* Progress Bar */}
              {status === 'uploading' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-slate-400">
                    <span>Uploading...</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: '75%', background: 'linear-gradient(to right, #0ea5e9, #8b5cf6)' }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={uploading || status === 'success'}
                className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300
                  ${status === 'success'
                    ? 'bg-green-500/15 text-green-400 border border-green-500/25 cursor-default'
                    : 'btn-primary'}`}
              >
                {uploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
                ) : status === 'success' ? (
                  <><CheckCircle className="w-4 h-4" />Uploaded Successfully</>
                ) : (
                  'Confirm & Upload'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadCard;
