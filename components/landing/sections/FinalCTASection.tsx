import React from 'react';
import { LandingContainer } from '../layout/LandingContainer';
import { SectionHeading } from '../ui/SectionHeading';
import { CTAButton } from '../ui/CTAButton';
import { authLinks } from '@/data/landing/config';

export function FinalCTASection() {
  return (
    <section className="py-24 md:py-32 bg-brand text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <LandingContainer className="relative z-10 flex flex-col items-center text-center">
        <SectionHeading 
          title={<span className="text-white">Make your next creative research session easier.</span>}
          description={<span className="text-brand-soft">Search, review, save and share ads from one organized workspace.</span>}
          className="mb-10"
        />
        <CTAButton href={authLinks.signUp} size="lg" variant="inverted">
          Start 7-Day Free Trial
        </CTAButton>
      </LandingContainer>
    </section>
  );
}
