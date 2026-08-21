import React from 'react';
import { LandingContainer } from '../layout/LandingContainer';

export function CoreValueSection() {
  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      <LandingContainer className="text-center">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-[36px] sm:text-[44px] md:text-[54px] leading-[1.05] font-bold tracking-tight text-text-primary text-balance mx-auto">
            Stop collecting screenshots. <br className="hidden md:block" />
            <span className="text-brand">Start building creative intelligence.</span>
          </h2>
          <p className="mt-6 text-[18px] md:text-[20px] leading-relaxed text-text-secondary max-w-[600px] mx-auto">
            A messy folder of inspiration isn&apos;t enough. AdsHunting organizes the market&apos;s best ads so you always know what works.
          </p>
        </div>
      </LandingContainer>
    </section>
  );
}
