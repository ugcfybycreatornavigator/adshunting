import React from 'react';
import Link from 'next/link';
import { LandingContainer } from './LandingContainer';
import { navigationConfig } from '@/data/landing/config';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-subtle pt-12 md:pt-16 pb-0 md:pb-0 overflow-hidden flex flex-col">
      <LandingContainer>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="font-bold text-xl tracking-tight text-text-primary">
              AdsHunting
            </Link>
            <p className="mt-4 text-sm text-text-secondary text-balance">
              Ad intelligence for creative research.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm text-text-primary mb-4 uppercase tracking-wider">Product</h3>
            <ul className="space-y-3">
              {navigationConfig.main.map(item => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-text-primary mb-4 uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-text-primary mb-4 uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              {navigationConfig.legal.map(item => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} AdsHunting. All rights reserved.
          </p>
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
            background: 'linear-gradient(180deg, #68B32F 0%, rgba(104, 179, 47, 0.72) 45%, rgba(104, 179, 47, 0.12) 88%, transparent 100%)',
            WebkitBackgroundClip: 'text',
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
