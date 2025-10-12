// app/page.tsx
'use client'

import React, { useState } from 'react';
import Navbar from '@/components/features/landing/Navbar';
import HeroSection from '@/components/features/landing/HeroSection';
import FeaturesSection from '@/components/features/landing/FeaturesSection';
import HowItWorksSection from '@/components/features/landing/HowItWorksSection';
import AICoPilotSection from '@/components/features/landing/AICoPilotSection';
import DashboardSection from '@/components/features/landing/DashboardSection';
import UseCasesSection from '@/components/features/landing/UseCasesSection';
import SecuritySection from '@/components/features/landing/SecuritySection';
import TestimonialsSection from '@/components/features/landing/TestimonialsSection';
import FaqSection from '@/components/features/landing/FaqSection';
import CtaSection from '@/components/features/landing/CtaSection';
import Footer from '@/components/features/landing/Footer';
import AuthModal from '@/components/features/landing/AuthModal';

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar onAuthButtonClick={openAuthModal} />
      <main>
        <HeroSection onAuthButtonClick={openAuthModal} />
        <FeaturesSection />
        <HowItWorksSection />
        <AICoPilotSection />
        <DashboardSection />
        <UseCasesSection />
        <TestimonialsSection />
        <SecuritySection />
        <FaqSection />
        <CtaSection onAuthButtonClick={openAuthModal} />
      </main>
      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </div>
  );
}