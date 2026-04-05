import React from 'react';
import { Cloud, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-white/5 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-6 md:gap-8 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-2">
            <Cloud className="text-primary w-5 h-5" />
            <span className="text-lg font-bold text-white">Cloudshare</span>
          </div>
          <p className="text-sm text-slate-500 max-w-xs text-center md:text-left">
            Empowering creators with secure, serverless file sharing solutions. 
            Built for speed, privacy, and simplicity.
          </p>
        </div>

        <div className="flex items-center gap-12 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
          <a href="#" className="hover:text-primary transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
