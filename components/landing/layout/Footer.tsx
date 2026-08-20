import React from 'react';
import Link from 'next/link';
import { LandingContainer } from './LandingContainer';
import { navigationConfig } from '@/data/landing/config';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-subtle py-12 md:py-16">
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
    </footer>
  );
}
