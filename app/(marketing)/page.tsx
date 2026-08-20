import React from 'react';
import { HeroSection } from '@/components/landing/sections/HeroSection';
import { AudienceSection } from '@/components/landing/sections/AudienceSection';
import { ProductFeatureSection } from '@/components/landing/product/ProductFeatureSection';
import { DiscoverDemo } from '@/components/landing/product/DiscoverDemo';
import { ReviewDemo } from '@/components/landing/product/ReviewDemo';
import { ResearchDemo } from '@/components/landing/product/ResearchDemo';
import { SaveDemo } from '@/components/landing/product/SaveDemo';
import { ShareDemo } from '@/components/landing/sections/ShareDemo';
import { ProblemSection } from '@/components/landing/sections/ProblemSection';
import { FAQSection } from '@/components/landing/sections/FAQSection';
import { FinalCTASection } from '@/components/landing/sections/FinalCTASection';
import { LandingContainer } from '@/components/landing/layout/LandingContainer';
import { CTAButton } from '@/components/landing/ui/CTAButton';
import { pricingPlans, authLinks } from '@/data/landing/config';
// Replaced by ProductFeatureSection components



function ShareSection() {
  return (
    <section id="shared-ads" className="py-[56px] md:py-[72px] lg:py-[96px] bg-[#fcfcfa] border-t border-[#e4e8e2] overflow-hidden">
      <LandingContainer>
        <div className="flex flex-col lg:flex-row items-center lg:items-center gap-12 lg:gap-16 xl:gap-24">
          
          <div className="flex-1 text-center lg:text-left w-full max-w-[600px] mx-auto lg:mx-0 flex flex-col justify-center order-1 lg:order-1">
            <span className="text-brand font-bold text-[12px] md:text-[13px] tracking-widest uppercase mb-4 block">05 — SHARE</span>
            <h2 className="text-[30px] md:text-[36px] lg:text-[44px] xl:text-[48px] font-bold text-text-primary leading-[1.15] mb-6 text-balance">
              Share an ad without losing control of access.
            </h2>
            <p className="text-[17px] md:text-[19px] text-text-secondary leading-relaxed max-w-[540px] mx-auto lg:mx-0">
              Use public sharing for open access or private sharing when the ad should remain protected. Manage all shared links in one place.
            </p>
          </div>

          <div className="flex-1 w-full relative order-2 lg:order-2">
             <ShareDemo />
          </div>

        </div>
      </LandingContainer>
    </section>
  );
}

function PricingSection() {
  const scoutPlan = pricingPlans.find(p => p.id === 'scout');
  const hunterPlan = pricingPlans.find(p => p.id === 'hunter');
  const agencyPlan = pricingPlans.find(p => p.id === 'agency');

  return (
    <section id="pricing" className="py-24 md:py-32 bg-[#f7f9f4] border-t border-border">
      <LandingContainer>
        <div className="flex flex-col items-center text-center mb-16 md:mb-20">
          <span className="text-brand font-semibold text-sm tracking-wide uppercase mb-4">
            Pricing
          </span>
          <h2 className="text-[34px] md:text-[44px] lg:text-[52px] leading-[1.1] font-bold tracking-tight text-text-primary text-balance max-w-[700px]">
            Choose the plan that fits your research workflow.
          </h2>
          <p className="text-[16px] md:text-[18px] leading-relaxed text-text-secondary max-w-[650px] text-balance mt-6">
            Start with Scout today. Hunter and Agency are being prepared for growing teams and larger research workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-[1200px] mx-auto items-stretch">
          {/* Scout Plan */}
          <div className="flex flex-col bg-surface rounded-[24px] p-7 md:p-8 border border-brand/45 shadow-[0_1px_2px_rgba(20,30,20,0.03),0_14px_40px_rgba(30,50,20,0.05)] relative hover:-translate-y-[3px] hover:shadow-[0_4px_6px_rgba(20,30,20,0.05),0_20px_50px_rgba(30,50,20,0.08)] transition-all duration-200">
            <div className="absolute top-0 inset-x-0 h-[80px] bg-brand/[0.03] rounded-t-[24px] pointer-events-none"></div>
            
            <div className="relative z-10">
              <span className="inline-flex items-center rounded-full bg-surface-green px-3 py-1 text-[11px] font-bold tracking-wide text-brand-strong border border-brand/20 mb-6 uppercase">
                {scoutPlan?.badge}
              </span>
              
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-xl bg-surface-green text-brand flex items-center justify-center">
                  {scoutPlan?.icon && React.createElement(scoutPlan.icon, { size: 20 })}
                </div>
                <h3 className="text-[28px] font-bold text-text-primary leading-none">{scoutPlan?.name}</h3>
              </div>
              <p className="text-[15px] text-text-secondary min-h-[44px]">{scoutPlan?.audience}</p>
              
              <div className="my-8 flex items-end gap-1.5">
                <span className="text-[44px] md:text-[54px] font-extrabold text-text-primary leading-[0.85] tracking-tight">{scoutPlan?.currency}{scoutPlan?.price}</span>
                <span className="text-[16px] font-medium text-text-muted mb-1">/ {scoutPlan?.period}</span>
              </div>
              
              <div className="mb-8">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-primary bg-surface-subtle px-3 py-1.5 rounded-lg border border-border">
                  <span className="w-2 h-2 rounded-full bg-brand"></span>
                  {scoutPlan?.trialDays}-Day Free Trial
                </span>
                <p className="text-[14px] text-text-secondary mt-3">Get access to the core AdsHunting research workflow.</p>
              </div>
            </div>

            <div className="flex-grow border-t border-border pt-8 relative z-10">
              <p className="text-[13px] font-bold tracking-wider text-text-primary uppercase mb-5">Included</p>
              <ul className="space-y-3.5 text-[15px] text-text-primary font-medium">
                {scoutPlan?.features?.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-brand mt-0.5">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-10 relative z-10">
              <CTAButton href={authLinks.signUp} className="w-full h-12 md:h-[52px] rounded-[14px] text-[16px]">
                Start {scoutPlan?.trialDays}-Day Free Trial
              </CTAButton>
            </div>
          </div>

          {/* Hunter Plan */}
          <div className="flex flex-col bg-surface rounded-[24px] p-7 md:p-8 border border-border shadow-[0_1px_2px_rgba(20,30,20,0.02)] hover:-translate-y-[2px] transition-transform duration-200">
            <span className="inline-flex items-center rounded-full bg-surface-subtle px-3 py-1 text-[11px] font-bold tracking-wide text-text-secondary border border-border mb-6 uppercase w-fit">
              {hunterPlan?.badge}
            </span>
            
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-xl bg-surface-subtle text-text-secondary flex items-center justify-center border border-border">
                {hunterPlan?.icon && React.createElement(hunterPlan.icon, { size: 20 })}
              </div>
              <h3 className="text-[28px] font-bold text-text-primary leading-none">{hunterPlan?.name}</h3>
            </div>
            <p className="text-[15px] text-text-secondary min-h-[44px]">{hunterPlan?.audience}</p>
            
            <div className="my-8 flex items-end h-[46px] md:h-[46px]">
              <span className="text-[22px] font-bold text-text-primary">{hunterPlan?.pricingLabel}</span>
            </div>
            
            <div className="mb-8">
              <p className="text-[14px] text-text-secondary mt-3">Designed for teams that need a broader AdsHunting workflow.</p>
            </div>

            <div className="flex-grow border-t border-border pt-8">
              <p className="text-[15px] font-medium text-text-primary mb-2">Everything in Scout <span className="font-bold">+</span ></p>
              <p className="text-[15px] text-text-secondary">Additional plan details will be announced soon.</p>
            </div>
            
            <div className="mt-10">
              <button disabled className="w-full h-12 md:h-[52px] rounded-[14px] text-[16px] font-medium border border-border bg-surface-subtle text-text-muted cursor-not-allowed">
                Coming Soon
              </button>
            </div>
          </div>

          {/* Agency Plan */}
          <div className="flex flex-col bg-surface rounded-[24px] p-7 md:p-8 border border-border shadow-[0_1px_2px_rgba(20,30,20,0.02)] hover:-translate-y-[2px] transition-transform duration-200 md:col-span-2 xl:col-span-1">
            <span className="inline-flex items-center rounded-full bg-surface-subtle px-3 py-1 text-[11px] font-bold tracking-wide text-text-secondary border border-border mb-6 uppercase w-fit">
              {agencyPlan?.badge}
            </span>
            
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-xl bg-surface-subtle text-text-secondary flex items-center justify-center border border-border">
                {agencyPlan?.icon && React.createElement(agencyPlan.icon, { size: 20 })}
              </div>
              <h3 className="text-[28px] font-bold text-text-primary leading-none">{agencyPlan?.name}</h3>
            </div>
            <p className="text-[15px] text-text-secondary min-h-[44px]">{agencyPlan?.audience}</p>
            
            <div className="my-8 flex items-end h-[46px] md:h-[46px]">
              <span className="text-[22px] font-bold text-text-primary">{agencyPlan?.pricingLabel}</span>
            </div>
            
            <div className="mb-8">
              <p className="text-[14px] text-text-secondary mt-3">Designed for larger research workflows and agency use cases.</p>
            </div>

            <div className="flex-grow border-t border-border pt-8">
              <p className="text-[15px] font-medium text-text-primary mb-2">Scout foundation <span className="font-bold">+</span ></p>
              <p className="text-[15px] text-text-secondary">Agency-level plan details coming soon.</p>
            </div>
            
            <div className="mt-10">
              <button disabled className="w-full h-12 md:h-[52px] rounded-[14px] text-[16px] font-medium border border-border bg-surface-subtle text-text-muted cursor-not-allowed">
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-text-muted">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-[13px] font-medium text-text-muted">
              AdsHunting does not provide private advertiser metrics such as ROAS, CTR, CPC, sales, or revenue.
            </p>
          </div>
        </div>
      </LandingContainer>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <AudienceSection />
      <ProblemSection />
      <ProductFeatureSection
        id="discover"
        step="01 — DISCOVER"
        title="Find relevant ads without digging through noise."
        description="Search brands and keywords, then narrow the results using the filters available inside AdsHunting."
        visual={<DiscoverDemo />}
        visualSide="right"
        className="bg-[#fcfcfa]"
      />
      
      <ProductFeatureSection
        step="02 — REVIEW"
        title="Review the ad with the context that matters."
        description="Open a creative and inspect the advertising information available through AdsHunting before deciding whether it is useful for your research."
        visual={<ReviewDemo />}
        visualSide="left"
        className="bg-[#ffffff]"
      />
      
      <ProductFeatureSection
        step="03 — RESEARCH"
        title="See how a brand is advertising."
        description="Review a brand's available creatives and compare observable patterns across its advertising activity."
        visual={<ResearchDemo />}
        visualSide="right"
        className="bg-[#f9faf8]"
      />
      
      <ProductFeatureSection
        id="swipe-files"
        step="04 — SAVE"
        title="Keep useful creatives easy to find again."
        description="Save ads into Swipe Files so useful references do not disappear into screenshots, bookmarks, or browser tabs."
        visual={<SaveDemo />}
        visualSide="left"
        className="bg-[#ffffff]"
      />

      <ShareSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
    </>
  );
}
