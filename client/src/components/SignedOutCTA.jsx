import React from 'react';
import { SignInButton } from '@clerk/clerk-react';
import { ShieldCheck, Zap, Users } from 'lucide-react';

const FEATURES = [
  {
    icon: <Zap className="w-6 h-6 text-[#0ea5e9]" />,
    title: 'Serverless Speed',
    desc: 'Files are processed in milliseconds via AWS Lambda — no cold start delays for uploads.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-[#8b5cf6]" />,
    title: 'Private by Default',
    desc: 'Every file is stored under your unique account. No one else can access your uploads.',
  },
  {
    icon: <Users className="w-6 h-6 text-[#22d3ee]" />,
    title: 'Instant Sharing',
    desc: 'Generate a download link for any file and share it with anyone in one click.',
  },
];

const SignedOutCTA = () => {
  return (
    <section className="px-4 sm:px-6 pb-24">
      <div className="max-w-5xl mx-auto">
        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {FEATURES.map((f, i) => (
            <div 
              key={f.title} 
              className="glass-card flex flex-col gap-5 group"
            >
              <div className={`
                w-14 h-14 rounded-2xl flex items-center justify-center
                bg-white/5 border border-white/10
                ${i === 0 ? 'glow-primary' : i === 1 ? 'glow-secondary' : 'glow-accent'}
              `}>
                {f.icon}
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-white text-lg tracking-tight">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Sign-in Banner */}
        <div
          className="glass-card text-center py-12 px-6"
          style={{
            background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(139,92,246,0.08))',
          }}
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Ready to get started?
          </h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm sm:text-base">
            Sign in to unlock your personal file vault. Uploads are free, instant, and secure.
          </p>
          <SignInButton mode="modal">
            <button className="btn-primary text-base px-10 py-4">
              Sign In to Upload →
            </button>
          </SignInButton>
        </div>
      </div>
    </section>
  );
};

export default SignedOutCTA;
