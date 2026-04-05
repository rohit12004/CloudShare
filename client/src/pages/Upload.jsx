import React from 'react';
import { useNavigate } from 'react-router-dom';
import UploadCard from '../components/UploadCard';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Upload = () => {
  const navigate = useNavigate();

  const handleUploadSuccess = () => {
    // Wait a brief moment for the success animation/toast, then redirect.
    setTimeout(() => {
      navigate('/my-files');
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <Link to="/my-files" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#0ea5e9] transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to my files
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Upload New Files</h1>
          <p className="text-slate-400">Securely upload documents, images, and other files to your cloud.</p>
        </div>

        <div className="">
          <UploadCard onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>
    </div>
  );
};

export default Upload;
