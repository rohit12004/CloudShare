import React, { useState } from 'react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/clerk-react';
import { Cloud, Menu, X, PlusCircle, Globe } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.607.069-.607 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.104-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.547 1.376.203 2.394.1 2.646.64.698 1.028 1.59 1.028 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const NAV_LINKS = [
  { label: 'Explore', to: '/explore' },
  { label: 'Docs', to: '#' },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const activeClassName = "text-[#0ea5e9]";
  const baseClassName = "hover:text-[#0ea5e9] transition-colors";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto glass rounded-2xl px-4 sm:px-6 py-3">
        {/* Main Row */}
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-[#0ea5e9] p-2 rounded-lg shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(14,165,233,0.4)]">
              <Cloud className="text-white w-5 h-5" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Cloud<span className="text-gradient">share</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            {NAV_LINKS.map((link) => (
              <NavLink 
                key={link.label} 
                to={link.to} 
                className={({ isActive }) => 
                  isActive && link.to !== '#' ? `${activeClassName} ${baseClassName}` : baseClassName
                }
              >
                {link.label}
              </NavLink>
            ))}
            <SignedIn>
              <NavLink 
                to="/upload" 
                className={({ isActive }) => isActive ? `${activeClassName} ${baseClassName} flex items-center gap-1.5` : `${baseClassName} flex items-center gap-1.5`}
              >
                Upload
              </NavLink>
              <NavLink 
                to="/my-files" 
                className={({ isActive }) => isActive ? `${activeClassName} ${baseClassName}` : baseClassName}
              >
                My Files
              </NavLink>
            </SignedIn>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white"
            >
              <GithubIcon />
            </a>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-primary text-sm py-2 px-4 shadow-lg shadow-[#0ea5e9]/20">Sign In</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-9 h-9 rounded-full ring-2 ring-[#0ea5e9]/50 shadow-md shadow-[#0ea5e9]/10',
                  },
                }}
              />
            </SignedIn>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-300"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) => 
                  `text-sm font-medium ${isActive && link.to !== '#' ? activeClassName : 'text-slate-300'} hover:text-[#0ea5e9] transition-colors px-1 py-1.5`
                }
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <SignedIn>
              <NavLink
                to="/upload"
                className={({ isActive }) => 
                  `text-sm font-medium ${isActive ? activeClassName : 'text-slate-300'} hover:text-[#0ea5e9] transition-colors px-1 py-1.5 flex items-center gap-2`
                }
                onClick={() => setMenuOpen(false)}
              >
                <PlusCircle className="w-4 h-4" />
                Upload
              </NavLink>
              <NavLink
                to="/my-files"
                className={({ isActive }) => 
                  `text-sm font-medium ${isActive ? activeClassName : 'text-slate-300'} hover:text-[#0ea5e9] transition-colors px-1 py-1.5`
                }
                onClick={() => setMenuOpen(false)}
              >
                My Files
              </NavLink>
            </SignedIn>
            <div className="flex items-center gap-3 pt-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn-primary text-sm py-2 px-4 w-full">Sign In</button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-3 w-full border-t border-white/5 pt-3 mt-1">
                  <UserButton />
                  <span className="text-sm text-slate-400 font-medium">Account Settings</span>
                </div>
              </SignedIn>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
