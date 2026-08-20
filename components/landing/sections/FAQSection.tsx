'use client';

import React from 'react';
import { LandingContainer } from '../layout/LandingContainer';
import { SectionHeading } from '../ui/SectionHeading';


export function FAQSection() {
  const faqs = [
    {
      q: "What is AdsHunting?",
      a: "AdsHunting is an ad intelligence and creative research workspace. It helps you search competitor creatives, review the details that matter, save useful inspiration, and share your research from one organized workspace."
    },
    {
      q: "What information does AdsHunting provide?",
      a: "AdsHunting focuses on observable advertising and creative research information available through supported sources, including ad status, format, runtime, and basic destination data."
    },
    {
      q: "Does AdsHunting provide ROAS, CTR, CPC, sales or revenue data?",
      a: "No. Those are private advertiser metrics and are not provided by Meta's public advertising data sources. AdsHunting focuses on observable advertising and creative research information available through supported sources."
    },
    {
      q: "Can I save ads?",
      a: "Yes. You can save ads and organize them into Swipe Files for easy reference later."
    },
    {
      q: "Can I share ads?",
      a: "Yes. You can create shareable links to share individual creatives or folders with your team or clients."
    }
  ];

  return (
    <section id="faq" className="py-20 md:py-32 bg-surface-subtle">
      <LandingContainer>
        <SectionHeading title="Frequently Asked Questions" className="mb-16" />
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq) => (
            <details key={faq.q} className="group bg-surface border border-border rounded-lg [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 rounded-lg p-6 text-text-primary font-semibold hover:bg-surface-subtle transition-colors">
                <h3 className="text-lg">{faq.q}</h3>
                <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </summary>
              <div className="px-6 pb-6 text-text-secondary leading-relaxed">
                <p>{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </LandingContainer>
    </section>
  );
}
