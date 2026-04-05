import React, { useState, useEffect } from 'react';
import FileList from '../components/FileList';

const MyFiles = () => {
  // Since we are no longer on the same page as the upload form, 
  // the file list will automatically refresh on mount.
  // We can keep the trigger if we ever add local actions (like rename/delete).

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Your Private Cloud</h1>
            <p className="text-slate-400">Manage and access all your securely stored files.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-slate-400">
              Synced to S3
            </span>
          </div>
        </div>
        
        <div className="glass-card overflow-hidden">
          <FileList refreshTrigger={0} />
        </div>
      </div>
    </div>
  );
};

export default MyFiles;
