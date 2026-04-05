import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Toaster } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import MyFiles from './pages/MyFiles';
import Upload from './pages/Upload';
import PublicFeed from './components/PublicFeed';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="flex-grow flex flex-col"
  >
    {children}
  </motion.div>
);

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Home Route */}
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        
        {/* Global Discovery Route */}
        <Route path="/explore" element={<PageWrapper><PublicFeed /></PageWrapper>} />

        {/* Protected My Files Route */}
        <Route
          path="/my-files"
          element={
            <PageWrapper>
              <SignedIn>
                <MyFiles />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn signInForceRedirectUrl="/my-files" />
              </SignedOut>
            </PageWrapper>
          }
        />

        {/* Protected Upload Route */}
        <Route
          path="/upload"
          element={
            <PageWrapper>
              <SignedIn>
                <Upload />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn signInForceRedirectUrl="/upload" />
              </SignedOut>
            </PageWrapper>
          }
        />

        {/* Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col selection:bg-[#0ea5e9]/30">
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f1f5f9',
              backdropFilter: 'blur(12px)',
            },
          }}
        />
        <Navbar />
        
        <main className="flex-grow pt-24 pb-32 flex flex-col relative z-0">
          <AnimatedRoutes />
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
