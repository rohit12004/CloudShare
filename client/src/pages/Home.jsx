import React from 'react';
import Hero from '../components/Hero';
import SignedOutCTA from '../components/SignedOutCTA';
import { SignedOut } from '@clerk/clerk-react';

const Home = () => {
  return (
    <>
      <Hero />
      <SignedOut>
        <SignedOutCTA />
      </SignedOut>
    </>
  );
};

export default Home;
