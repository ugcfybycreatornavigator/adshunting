import React from 'react';
import { LandingContainer } from '../layout/LandingContainer';
import { CTAButton } from '../ui/CTAButton';
import { authLinks } from '@/data/landing/config';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
      <LandingContainer className="flex flex-col items-center text-center">
        <span className="text-brand font-semibold text-sm tracking-wide uppercase mb-6">
          Ad Intelligence & Creative Research
        </span>
        <h1 className="text-[38px] sm:text-[44px] md:text-[58px] lg:text-[76px] leading-[1.05] font-bold tracking-tight text-text-primary max-w-4xl text-balance">
          Find the ads worth studying.
        </h1>
        <p className="mt-6 text-[15px] md:text-[18px] leading-relaxed text-text-secondary max-w-2xl text-balance">
          Search competitor creatives, review the details that matter, save useful inspiration, and share your research from one organized workspace.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <CTAButton href={authLinks.signUp} size="lg" className="w-full sm:w-auto">
            Start 7-Day Free Trial
          </CTAButton>
          <CTAButton href="#discover" variant="outline" size="lg" className="w-full sm:w-auto">
            Explore Product
          </CTAButton>
        </div>
      </LandingContainer>
    </section>
  );
}
