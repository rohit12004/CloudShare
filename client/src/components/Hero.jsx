import { Share2, Lock, Zap } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative pb-16 sm:pb-20 px-4 sm:px-6 overflow-hidden max-h-screen flex items-center">
      <div className="max-w-4xl mx-auto text-center w-full">
        <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-8">
          <Zap className="w-4 h-4 text-[#0ea5e9]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Next Generation Storage
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
          Share files with <br />
          <span className="text-gradient">zero friction</span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Cloudshare is a lightning-fast, secure file sharing platform built on
          serverless architecture. Upload, share, and manage your assets with
          unmatched speed and privacy.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn-primary text-base px-8 py-4 w-full sm:w-auto">
                Get Started Free →
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link
              to="/upload"
              className="btn-primary text-base px-8 py-4 w-full sm:w-auto text-center"
            >
              Upload a File →
            </Link>
          </SignedIn>

          <a
            href="#"
            className="glass text-sm font-medium text-slate-300 px-8 py-4 rounded-xl hover:border-white/25 transition-all w-full sm:w-auto"
          >
            View Docs
          </a>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-slate-500">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">End-to-end Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-medium">Instant Sharing</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Serverless Speed</span>
          </div>
        </div>
      </div>

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-[#0ea5e9]/20 blur-[120px] rounded-full -z-10 opacity-25 pointer-events-none" />
    </div>
  );
};

export default Hero;
