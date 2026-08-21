'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LandingContainer } from '../layout/LandingContainer';
import { CTAButton } from '../ui/CTAButton';
import { authLinks } from '@/data/landing/config';
import { ArrowRight, Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PLACEHOLDERS = [
  "Search brands, ads or competitors...",
  "e.g. 'Aether Athletics'",
  "e.g. 'Nike running shoes'",
  "e.g. 'Beauty campaigns 2026'"
];

export function HeroSection() {
  const [searchValue, setSearchValue] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [placeholderText, setPlaceholderText] = useState('');
  const router = useRouter();

  useEffect(() => {
    let currentPlaceholderIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    const type = () => {
      const currentFullText = PLACEHOLDERS[currentPlaceholderIndex];

      if (isDeleting) {
        setPlaceholderText(currentFullText.substring(0, currentCharIndex - 1));
        currentCharIndex--;
      } else {
        setPlaceholderText(currentFullText.substring(0, currentCharIndex + 1));
        currentCharIndex++;
      }

      let typingSpeed = isDeleting ? 30 : 70;

      if (!isDeleting && currentCharIndex === currentFullText.length) {
        // Pause at end of typing
        typingSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && currentCharIndex === 0) {
        // Move to next word
        isDeleting = false;
        currentPlaceholderIndex = (currentPlaceholderIndex + 1) % PLACEHOLDERS.length;
        typingSpeed = 500;
      }

      timeoutId = setTimeout(type, typingSpeed);
    };

    timeoutId = setTimeout(type, 500);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    
    setIsRedirecting(true);
    // Simulate a brief delay for polish before redirecting
    setTimeout(() => {
      // Pass the search term as a query param so the signup page or subsequent onboarding can potentially use it
      router.push(`${authLinks.signUp}?search=${encodeURIComponent(searchValue)}`);
    }, 1200);
  };

  return (
    <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32 bg-[#FCFDFB]">
      {/* Animated Liquid Mesh Gradient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        
        {/* Core wrapper with heavy blur to fuse the blobs together */}
        <div className="absolute w-[120vw] h-[120vh] blur-[100px] md:blur-[140px] opacity-70">
          
          {/* Main central liquid body */}
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[40vw] rounded-[100%] bg-brand/20"
            animate={{
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1],
              x: ["-50%", "-45%", "-55%", "-50%"],
              y: ["-50%", "-40%", "-60%", "-50%"]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />

          {/* Sweeping wave 1 */}
          <motion.div 
            className="absolute top-[20%] left-[10%] w-[50vw] h-[60vw] rounded-[100%] bg-[#83D146]/20"
            animate={{
              rotate: [360, 180, 0],
              scale: [1, 1.3, 0.9, 1],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />

          {/* Sweeping wave 2 */}
          <motion.div 
            className="absolute bottom-[10%] right-[10%] w-[60vw] h-[50vw] rounded-[100%] bg-[#539620]/15"
            animate={{
              rotate: [0, 120, 240, 360],
              scale: [0.9, 1.1, 1.3, 0.9],
              x: ["0%", "-10%", "5%", "0%"]
            }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          />

        </div>

        {/* Crisp noise overlay to give it a premium matte finish */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay" />
        
        {/* White vignette gradient to blend edges into the page */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FCFDFB] via-transparent to-[#FCFDFB] opacity-80" />
      </div>

      <LandingContainer className="flex flex-col items-center text-center relative z-10">
        
        {/* Headline & Copy */}
        <div className="max-w-[1000px] mx-auto z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-[42px] sm:text-[56px] md:text-[72px] lg:text-[84px] leading-[0.96] font-bold tracking-[-0.04em] text-text-primary text-balance mx-auto">
              Find the ads worth <br className="hidden sm:block" /> stealing inspiration from.
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="mt-6 md:mt-8 text-[17px] md:text-[20px] leading-relaxed text-text-secondary max-w-[640px] mx-auto text-balance">
              Search competitor creatives, review the details that matter, save useful inspiration, and share your research from one organized workspace.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <CTAButton href={authLinks.signUp} size="lg" className="w-full sm:w-auto text-[16px] h-12 md:h-14 px-8 shadow-sm">
              Start 7-Day Free Trial
            </CTAButton>
          </motion.div>
        </div>

        {/* Visual Product Search */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full mt-16 md:mt-24 relative z-10 max-w-[1200px] mx-auto"
        >
          {/* Decorative glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

          {/* Search Input Interactive */}
          <form 
            onSubmit={handleSearch}
            className="mx-auto w-full max-w-[680px] bg-white rounded-2xl md:rounded-[20px] border border-border/80 shadow-[0_8px_30px_rgb(0,0,0,0.04),0_20px_80px_rgb(0,0,0,0.06)] flex items-center p-2 md:p-3 h-[72px] md:h-[88px] relative z-20 transition-all duration-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06),0_24px_100px_rgb(0,0,0,0.08)] focus-within:shadow-[0_12px_40px_rgb(0,0,0,0.06),0_24px_100px_rgb(0,0,0,0.08)] focus-within:border-brand/30 focus-within:ring-4 focus-within:ring-brand/10"
          >
            <div className="pl-4 md:pl-6 pr-2 flex items-center justify-center">
               <Search className="text-text-muted/60" size={24} strokeWidth={1.75} />
            </div>
            <input 
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={placeholderText || "Search brands, ads or competitors..."}
              className="flex-1 h-full min-w-0 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-[17px] md:text-[20px] text-text-primary font-medium placeholder:text-text-muted/50 placeholder:font-normal px-2"
              disabled={isRedirecting}
            />
            <button 
              type="submit"
              disabled={isRedirecting || !searchValue.trim()}
              className="ml-2 h-full px-6 md:px-8 rounded-xl md:rounded-[14px] bg-brand text-white font-semibold flex items-center justify-center transition-all duration-300 hover:bg-brand-strong hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 text-[15px] md:text-[17px]"
            >
              {isRedirecting ? (
                <>
                  <Loader2 size={20} className="animate-spin md:mr-2" />
                  <span className="hidden md:inline">Redirecting...</span>
                </>
              ) : (
                <>
                  <span className="mr-2">Search</span> <ArrowRight size={20} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>
          
          {isRedirecting && (
             <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="mt-6 flex flex-col items-center justify-center gap-2"
             >
               <p className="text-[15px] font-semibold text-brand">
                 Preparing your search results...
               </p>
               <p className="text-[13px] text-text-secondary max-w-[400px]">
                 Create a free account to view full competitor analysis and creative details.
               </p>
             </motion.div>
          )}

        </motion.div>
      </LandingContainer>
    </section>
  );
}

