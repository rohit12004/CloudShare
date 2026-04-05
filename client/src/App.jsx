import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import MyFiles from './pages/MyFiles';
import Upload from './pages/Upload';
import PublicFeed from './components/PublicFeed';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col">
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
        
        <main className="flex-grow pt-24 pb-12">
          <Routes>
            {/* Public Home Route */}
            <Route path="/" element={<Home />} />
            
            {/* New: Global Discovery Route */}
            <Route path="/explore" element={<PublicFeed />} />

            {/* Protected My Files Route */}
            <Route
              path="/my-files"
              element={
                <>
                  <SignedIn>
                    <MyFiles />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn signInForceRedirectUrl="/my-files" />
                  </SignedOut>
                </>
              }
            />

            {/* Protected Upload Route */}
            <Route
              path="/upload"
              element={
                <>
                  <SignedIn>
                    <Upload />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn signInForceRedirectUrl="/upload" />
                  </SignedOut>
                </>
              }
            />

            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
