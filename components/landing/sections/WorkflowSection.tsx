'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LandingContainer } from '@/components/landing/layout/LandingContainer';
import { Search, SlidersHorizontal, Video, Play, ExternalLink, Bookmark, Check, Share2, Eye, Copy } from 'lucide-react';
import { demoAds } from '@/data/landing/demoAds';

const steps = [
  {
    id: 'discover',
    label: '01 — DISCOVER',
    title: 'Find relevant ads without digging through noise.',
    description: 'Search a massive creative library by keyword, brand, format, category, and more.'
  },
  {
    id: 'review',
    label: '02 — REVIEW',
    title: 'Review the ad with the context that matters.',
    description: 'Review ad creatives at a glance with rich cards, quick metadata, and clear visual context.'
  },
  {
    id: 'research',
    label: '03 — RESEARCH',
    title: 'See how a brand is advertising.',
    description: 'Go beyond screenshots—study the messaging, creative structure, and brand patterns behind every ad.'
  },
  {
    id: 'save',
    label: '04 — SAVE',
    title: 'Keep useful creatives easy to find again.',
    description: 'Save high-signal creatives into organized swipe files so your team never loses great references.'
  },
  {
    id: 'share',
    label: '05 — SHARE',
    title: 'Share an ad without losing control of access.',
    description: 'Share winning creatives instantly with your team and turn research into action faster.'
  }
];

function WorkflowMockup({ activeStep }: { activeStep: number }) {
  const ad = demoAds[0];
  const [searchStep, setSearchStep] = useState(0);

  // Auto-typing animation for Discover step
  useEffect(() => {
    if (activeStep === 0) {
      const t1 = setTimeout(() => setSearchStep(1), 800);
      const t2 = setTimeout(() => setSearchStep(2), 1600);
      const t3 = setTimeout(() => setSearchStep(3), 2200);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    } else {
      setSearchStep(3);
    }
  }, [activeStep]);

  return (
    <div className="w-full h-full bg-[#fcfcfa] rounded-[24px] border border-[#e4e8e2] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col relative">
      
      {/* Top Navigation / Search Area (Discover & Share) */}
      <motion.div 
        className="px-5 py-4 border-b border-[#e4e8e2] bg-white flex items-center justify-between shrink-0 relative z-20"
        initial={false}
        animate={{
           height: activeStep === 0 ? 'auto' : (activeStep === 4 ? 'auto' : '64px'),
           paddingBottom: activeStep === 0 ? '20px' : '16px'
        }}
      >
         <div className="flex items-center gap-4 w-full">
            <div className="flex gap-1.5 shrink-0 hidden sm:flex">
              <div className="w-3 h-3 rounded-full bg-[#e4e8e2]"></div>
              <div className="w-3 h-3 rounded-full bg-[#e4e8e2]"></div>
              <div className="w-3 h-3 rounded-full bg-[#e4e8e2]"></div>
            </div>
            
            {/* Search Bar */}
            <div className={cn(
              "flex-1 flex items-center gap-3 px-3 py-2 rounded-lg border transition-all max-w-[340px]",
              activeStep === 0 && searchStep > 0 ? "border-brand ring-2 ring-brand/10 bg-white" : "border-[#e4e8e2] bg-[#fcfcfa]"
            )}>
              <Search size={16} className="text-text-muted" />
              <div className="text-[14px]">
                 {searchStep === 0 && <span className="text-text-muted">Search ads...</span>}
                 {searchStep > 0 && <span className="text-text-primary font-medium">Frido<span className={cn("inline-block w-[2px] h-3.5 bg-brand ml-0.5 align-middle", searchStep > 1 && searchStep < 3 && "animate-pulse", searchStep >= 3 && "hidden")}></span></span>}
              </div>
            </div>

            {/* Share Button (Step 4) */}
            {activeStep === 4 && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-[13px] font-bold shadow-sm"
              >
                <Share2 size={16} /> Share Ad
              </motion.button>
            )}
         </div>

         {/* Suggestions Dropdown */}
         {activeStep === 0 && searchStep === 2 && (
            <div className="absolute top-[60px] left-[70px] w-[300px] bg-white border border-[#e4e8e2] rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-1.5">
                <div className="px-3 py-2 hover:bg-[#f9faf8] rounded-md text-[13px] font-medium cursor-pointer">Frido</div>
                <div className="px-3 py-2 hover:bg-[#f9faf8] rounded-md text-[13px] text-text-secondary cursor-pointer">Frido India</div>
              </div>
            </div>
         )}
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-[#fcfcfa] overflow-hidden">
        
        {/* State 0: Discover Grid */}
        <motion.div 
          className="absolute inset-0 p-5 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: activeStep === 0 ? 1 : 0, 
            pointerEvents: activeStep === 0 ? 'auto' : 'none',
            y: activeStep === 0 ? 0 : -20 
          }}
          transition={{ duration: 0.4 }}
        >
           <div className="flex items-center gap-2 mb-5">
             <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#e4e8e2] rounded-lg text-[13px] font-medium"><SlidersHorizontal size={14} /> Filters</button>
             <span className="px-3 py-1.5 bg-[#eef4ec] border border-[#d2dfcb] text-brand rounded-lg text-[13px] font-bold">Active</span>
             <span className="px-3 py-1.5 bg-white border border-[#e4e8e2] text-text-secondary rounded-lg text-[13px] font-medium">Video</span>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             {demoAds.slice(0, 3).map((demo, idx) => (
                <div key={idx} className={cn("rounded-xl border border-[#e4e8e2] overflow-hidden relative aspect-[4/5] bg-white", searchStep < 3 && "opacity-0 translate-y-4", searchStep === 3 && "animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards", idx === 1 && "delay-100", idx === 2 && "delay-200")}>
                  <img src={demo.thumbnail} className="w-full h-full object-cover" alt="" />
                  <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded p-1.5"><Video size={12} className="text-white" /></div>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></div><span className="text-[10px] font-bold text-white uppercase drop-shadow-md">{demo.brand}</span></div>
                </div>
             ))}
           </div>
        </motion.div>

        {/* State 1, 3, 4: Review Panel, Save, Share */}
        <motion.div 
          className="absolute inset-0 bg-white flex"
          initial={{ opacity: 0, x: 20 }}
          animate={{ 
            opacity: (activeStep === 1 || activeStep === 3 || activeStep === 4) ? 1 : 0, 
            pointerEvents: (activeStep === 1 || activeStep === 3 || activeStep === 4) ? 'auto' : 'none',
            x: (activeStep === 1 || activeStep === 3 || activeStep === 4) ? 0 : 20 
          }}
          transition={{ duration: 0.4 }}
        >
          {/* Ad Media */}
          <div className="w-1/2 bg-[#fcfcfa] border-r border-[#e4e8e2] relative flex items-center justify-center p-6">
            <div className="w-full aspect-[4/5] rounded-xl overflow-hidden border border-[#e4e8e2] shadow-sm relative group cursor-pointer">
               <img src={ad.thumbnail} className="w-full h-full object-cover" alt="" />
               <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                 <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform"><Play size={24} className="text-text-primary ml-1" /></div>
               </div>
            </div>
            
            {/* Save interaction overlay (Step 3) */}
            {activeStep === 3 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-8 right-8 z-20"
              >
                <div className="bg-white border border-[#e4e8e2] shadow-lg rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#eef4ec] text-brand rounded-full flex items-center justify-center">
                    <Check size={20} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-text-primary">Saved successfully</p>
                    <p className="text-[12px] text-text-secondary">Added to <span className="font-medium text-text-primary">Competitor Ads</span></p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Share interaction overlay (Step 4) */}
            {activeStep === 4 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-x-8 bottom-8 z-20"
              >
                <div className="bg-[#111217] shadow-xl rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-white">
                    <span className="text-[13px] font-semibold">Share link generated</span>
                    <span className="text-[11px] text-white/60">Expires in 7 days</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2 border border-white/10">
                    <span className="flex-1 text-[12px] text-white/80 font-mono truncate">adshunting.com/share/f8a92...</span>
                    <button className="px-3 py-1.5 bg-white text-black text-[12px] font-bold rounded-md flex items-center gap-1.5"><Copy size={12} /> Copied</button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Ad Details */}
          <div className="w-1/2 p-6 flex flex-col bg-white overflow-y-auto">
            <h4 className="text-[12px] font-bold text-text-muted uppercase tracking-widest mb-6">Creative Review</h4>
            <div className="space-y-6">
               <div>
                 <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Advertiser</p>
                 <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-[#f2f6f0] border border-[#d2dfcb] flex items-center justify-center text-[10px] font-bold text-brand">F</div><span className="text-[15px] font-bold text-text-primary">{ad.brand}</span></div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Status</p>
                   <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#eef4ec] border border-[#d2dfcb] text-brand text-[12px] font-bold"><div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></div> Active</span>
                 </div>
                 <div>
                   <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Format</p>
                   <span className="inline-flex px-2 py-1 rounded border border-[#e4e8e2] text-text-secondary text-[12px] font-medium capitalize">{ad.format}</span>
                 </div>
               </div>
               <div>
                 <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Primary Text</p>
                 <p className="text-[13px] text-text-secondary leading-relaxed bg-[#f9faf8] p-3 rounded-lg border border-[#e4e8e2]">{ad.primaryText}</p>
               </div>
               <div className="pt-4 flex gap-3">
                 <button className={cn("flex-1 py-2 rounded-lg text-[13px] font-bold flex items-center justify-center gap-2 transition-colors", activeStep === 3 ? "bg-brand text-white" : "bg-[#fcfcfa] border border-[#e4e8e2] text-text-primary")}><Bookmark size={16} /> {activeStep === 3 ? 'Saved' : 'Save'}</button>
                 <button className="flex-1 py-2 bg-[#fcfcfa] border border-[#e4e8e2] rounded-lg text-[13px] font-bold text-text-primary flex items-center justify-center gap-2"><ExternalLink size={16} /> Original</button>
               </div>
            </div>
          </div>
        </motion.div>

        {/* State 2: Research Brand Library */}
        <motion.div 
          className="absolute inset-0 bg-[#fcfcfa] flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: activeStep === 2 ? 1 : 0, 
            pointerEvents: activeStep === 2 ? 'auto' : 'none',
            y: activeStep === 2 ? 0 : 20 
          }}
          transition={{ duration: 0.4 }}
        >
          <div className="p-5 border-b border-[#e4e8e2] bg-white shrink-0">
             <div className="flex items-center gap-4 mb-4">
               <div className="w-10 h-10 rounded-lg bg-[#f2f6f0] border border-[#d2dfcb] flex items-center justify-center text-[18px] font-bold text-brand">F</div>
               <div>
                 <h3 className="text-[16px] font-bold text-text-primary">Frido Library</h3>
                 <span className="text-[12px] text-text-secondary">14 Active Creatives</span>
               </div>
             </div>
             <div className="flex items-center gap-2 text-[12px] font-medium text-text-muted bg-[#f9faf8] border border-[#e4e8e2] rounded-lg px-3 py-2">
               <Eye size={14} className="text-brand shrink-0" />
               <span>Researching format distribution and messaging angles</span>
             </div>
          </div>
          <div className="flex-1 p-5 overflow-hidden flex flex-col">
            <div className="flex gap-2 mb-4 shrink-0">
              <span className="px-3 py-1.5 bg-[#eef4ec] text-brand border border-[#d2dfcb] rounded-full text-[12px] font-bold">All Creatives</span>
              <span className="px-3 py-1.5 bg-white border border-[#e4e8e2] text-text-secondary rounded-full text-[12px] font-medium">Video</span>
            </div>
            <div className="grid grid-cols-3 gap-3 overflow-y-auto pr-1">
               {demoAds.slice(0, 6).map((demo, idx) => (
                  <div key={idx} className="rounded-xl border border-[#e4e8e2] overflow-hidden relative aspect-square bg-white">
                    <img src={demo.thumbnail} className="w-full h-full object-cover opacity-90" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute top-2 right-2 bg-black/40 rounded-full p-1"><Video size={10} className="text-white" /></div>
                  </div>
               ))}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

function StepItem({ step, isActive, onActivate }: { step: typeof steps[0], isActive: boolean, onActivate: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "-45% 0px -45% 0px" });

  useEffect(() => {
    if (isInView && !isActive) {
      onActivate();
    }
  }, [isInView, isActive, onActivate]);

  return (
    <div 
      ref={ref}
      className={cn(
        "flex flex-col py-8 md:py-24 transition-opacity duration-300 cursor-pointer",
        isActive ? "opacity-100" : "opacity-30 hover:opacity-50"
      )}
      onClick={onActivate}
    >
      <span className="text-brand font-bold text-[12px] tracking-widest uppercase mb-4 block">
        {step.label}
      </span>
      <h3 className="text-[28px] md:text-[36px] font-bold text-text-primary leading-[1.15] mb-4 text-balance">
        {step.title}
      </h3>
      <p className="text-[16px] md:text-[18px] text-text-secondary leading-relaxed">
        {step.description}
      </p>
    </div>
  );
}

export function WorkflowSection() {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section id="workflow" className="py-24 md:py-32 bg-[#ffffff] border-t border-[#e4e8e2] relative">
      <LandingContainer>
        
        {/* Section Header */}
        <div className="max-w-[700px] mb-16 md:mb-24 text-center md:text-left">
          <h2 className="text-[34px] md:text-[44px] lg:text-[52px] leading-[1.1] font-bold tracking-tight text-text-primary text-balance">
            How AdsHunting turns ad chaos into creative intelligence.
          </h2>
          <p className="text-[16px] md:text-[20px] text-text-secondary mt-6 max-w-[600px] leading-relaxed">
            A faster workflow for finding, reviewing, saving, and sharing winning ads with your team.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 relative" ref={containerRef}>
          
          {/* Left Column: Steps (Scrollable) */}
          <div className="w-full lg:w-5/12 flex flex-col relative z-10 pb-[30vh]">
            <div className="hidden lg:block absolute left-[-20px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[#e4e8e2] to-transparent">
              <motion.div 
                className="w-full bg-brand rounded-full"
                initial={{ height: "0%", top: "0%" }}
                animate={{ 
                  height: "20%", 
                  top: `${(activeStep / (steps.length - 1)) * 80}%` 
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                style={{ position: 'absolute' }}
              />
            </div>
            
            {steps.map((step, index) => (
              <StepItem 
                key={step.id} 
                step={step} 
                isActive={activeStep === index} 
                onActivate={() => setActiveStep(index)} 
              />
            ))}
          </div>

          {/* Right Column: Sticky Mockup */}
          <div className="hidden lg:block lg:w-7/12 relative">
             <div className="sticky top-32 h-[560px] w-full">
                <WorkflowMockup activeStep={activeStep} />
             </div>
          </div>

          {/* Mobile Fallback Mockup (shows below active step) */}
          <div className="block lg:hidden w-full h-[400px] sticky bottom-10 mt-[-20vh] z-0 px-4 pointer-events-none opacity-40">
             <WorkflowMockup activeStep={activeStep} />
          </div>

        </div>
      </LandingContainer>
    </section>
  );
}
