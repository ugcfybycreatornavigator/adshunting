import React from 'react';
import Link from 'next/link';
import { LandingContainer } from './LandingContainer';
import { navigationConfig } from '@/data/landing/config';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-subtle pt-10 pb-8 md:pt-16 md:pb-12 overflow-hidden flex flex-col">
      <LandingContainer>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-x-6 gap-y-10 md:gap-8 lg:gap-12">

          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 flex flex-col items-start min-w-0">
            <Link
              href="/"
              className="font-bold text-xl tracking-tight text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[#68B32F] rounded-sm"
            >
              AdsHunting
            </Link>
            <p className="mt-4 text-[14px] leading-relaxed text-text-secondary break-words overflow-wrap-anywhere max-w-sm">
              Ad intelligence for creative research.
            </p>
          </div>

          {/* Product Column */}
          <div className="flex flex-col col-span-1">
            <h3 className="font-semibold text-[13px] text-text-primary mb-4 uppercase tracking-wider">Product</h3>
            <ul className="space-y-3">
              {navigationConfig.product.map(item => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[14px] text-text-secondary hover:text-[#5a9c29] transition-colors py-1 inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#68B32F] rounded-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              {navigationConfig.main.map(item => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[14px] text-text-secondary hover:text-[#5a9c29] transition-colors py-1 inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#68B32F] rounded-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div className="flex flex-col col-span-1">
            <h3 className="font-semibold text-[13px] text-text-primary mb-4 uppercase tracking-wider">Resources</h3>
            <ul className="space-y-3">
              {navigationConfig.resources.map(item => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[14px] text-text-secondary hover:text-[#5a9c29] transition-colors py-1 inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#68B32F] rounded-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="flex flex-col col-span-1">
            <h3 className="font-semibold text-[13px] text-text-primary mb-4 uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-[14px] text-text-secondary hover:text-[#5a9c29] transition-colors py-1 inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#68B32F] rounded-sm"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[14px] text-text-secondary hover:text-[#5a9c29] transition-colors py-1 inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#68B32F] rounded-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="flex flex-col col-span-1">
            <h3 className="font-semibold text-[13px] text-text-primary mb-4 uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              {navigationConfig.legal.map(item => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[14px] text-text-secondary hover:text-[#5a9c29] transition-colors py-1 inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#68B32F] rounded-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-[13px] text-text-muted">
            © {new Date().getFullYear()} AdsHunting. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            {navigationConfig.legal.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className="text-[13px] text-text-muted hover:text-[#5a9c29] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#68B32F] rounded-sm"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </LandingContainer>

      {/* Oversized Brand Wordmark */}
      <div
        className="w-full flex justify-center px-3 md:px-5 lg:px-6 pt-6 md:pt-10 pb-0 md:pb-2 overflow-hidden select-none pointer-events-none mt-auto"
        aria-hidden="true"
      >
        <div
          className="font-extrabold text-center tracking-[-0.055em] leading-[0.78]"
          style={{
            fontSize: 'clamp(4.5rem, 19.5vw, 22rem)',
            background: 'linear-gradient(180deg, #68B32F 0%, rgba(104,179,47,0.72) 45%, rgba(104,179,47,0.15) 85%, transparent 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          AdsHunting
        </div>
      </div>
    </footer>
  );
}
