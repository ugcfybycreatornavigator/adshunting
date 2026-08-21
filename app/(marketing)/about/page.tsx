import type { Metadata } from 'next';
import { AboutContent } from '@/components/landing/about/AboutContent';

export const metadata: Metadata = {
  title: 'About AdsHunting | Creative Intelligence for Advertising',
  description: 'AdsHunting is a creative intelligence workspace built to help teams discover ads, understand competitor creative, organize inspiration, and share what matters.',
};

export default function AboutPage() {
  return <AboutContent />;
}
