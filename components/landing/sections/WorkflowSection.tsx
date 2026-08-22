'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LandingContainer } from '@/components/landing/layout/LandingContainer';
import { Search, Play, Heart, Users, Filter, Plus, Share, CheckCircle2, ChevronRight, X, FolderTree } from 'lucide-react';
import { workflowAds } from '@/data/landing/workflowAds';
import { CTAButton } from '../ui/CTAButton';
import { authLinks } from '@/data/landing/config';

type Tab = 'find' | 'understand' | 'organize';

export function WorkflowSection() {
  const [activeTab, setActiveTab] = useState<Tab>('find');
  const [searchValue, setSearchValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Animated search sequence for Find state
  useEffect(() => {
    if (activeTab === 'find') {
      const sequence = async () => {
        setSearchValue('');
        setIsTyping(false);
        await new Promise(resolve => setTimeout(resolve, 600));
        setIsTyping(true);
        const text = 'Aether Athletics';
        for (let i = 0; i <= text.length; i++) {
          setSearchValue(text.slice(0, i));
          await new Promise(resolve => setTimeout(resolve, 80));
        }
        setIsTyping(false);
      };
      sequence();
    }
  }, [activeTab]);

  const tabs = [
    { id: 'find', label: 'FIND', desc: 'Find the creative worth studying.' },
    { id: 'understand', label: 'UNDERSTAND', desc: 'See the thinking behind every creative.' },
    { id: 'organize', label: 'ORGANIZE', desc: 'Turn inspiration into something your team can use.' },
  ];

  // Helper to determine line fill
  const getLineFill = (index: number) => {
    const activeIndex = tabs.findIndex(t => t.id === activeTab);
    return index < activeIndex;
  };

  const sampleAd = workflowAds.find(ad => ad.id === 'ad_beauty_1') || workflowAds[0];

  return (
    <section id="workflow" className="py-24 md:py-32 bg-slate-50 border-t border-b border-border overflow-hidden relative">
      {/* Subtle background radial gradient */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'radial-gradient(circle at 50% 35%, rgba(37,99,235,0.05), transparent 40%)'
        }}
      />
      
      <LandingContainer className="relative z-10">
        
        {/* Continuous Progress Header */}
        <div className="max-w-[800px] mx-auto mb-16 md:mb-20">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-brand font-semibold text-sm tracking-widest uppercase mb-4">
              How AdsHunting Works
            </span>
          </div>

          <div className="relative">
            {/* The Line */}
            <div className="absolute top-4 left-[15%] right-[15%] h-0.5 bg-border rounded-full" />
            
            {/* Active Line Fill */}
            <div 
              className="absolute top-4 left-[15%] h-0.5 bg-brand rounded-full transition-all duration-700 ease-in-out" 
              style={{
                width: activeTab === 'find' ? '0%' : activeTab === 'understand' ? '35%' : '70%'
              }}
            />

            <div className="flex justify-between relative z-10">
              {tabs.map((tab, idx) => (
                <div key={tab.id} className="flex flex-col items-center text-center w-1/3 group cursor-pointer" onClick={() => setActiveTab(tab.id as Tab)}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ring-4 ring-slate-50 mb-6",
                    activeTab === tab.id ? "bg-brand border-2 border-brand" :
                    getLineFill(idx) ? "bg-brand border-2 border-brand" : "bg-white border-2 border-border-strong group-hover:border-brand-strong"
                  )}>
                    {getLineFill(idx) ? (
                       <CheckCircle2 size={16} className="text-white" />
                    ) : (
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full transition-all duration-300",
                        activeTab === tab.id ? "bg-white" : "bg-transparent"
                      )} />
                    )}
                  </div>
                  
                  <h3 className={cn(
                    "text-[12px] font-bold tracking-widest mb-2 transition-colors",
                    activeTab === tab.id || getLineFill(idx) ? "text-text-primary" : "text-text-muted"
                  )}>
                    {tab.label}
                  </h3>
                  
                  <div className={cn(
                    "text-[16px] md:text-[22px] font-bold leading-tight transition-all duration-500 max-w-[250px]",
                    activeTab === tab.id ? "text-text-primary opacity-100 translate-y-0" : "text-text-muted opacity-0 translate-y-2 pointer-events-none absolute top-full"
                  )}>
                    {tab.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Visual Stage */}
        <div className="max-w-[1100px] mx-auto w-full min-h-[500px] md:min-h-[640px] bg-white rounded-[24px] border border-border shadow-[0_8px_40px_rgba(0,0,0,0.06)] overflow-hidden relative">
          
          <AnimatePresence mode="wait">
            {/* FIND */}
            {activeTab === 'find' && (
              <motion.div
                key="find"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex flex-col bg-white"
              >
                {/* Find Top Bar */}
                <div className="px-6 py-5 border-b border-border flex items-center gap-4">
                  <div className="flex-1 max-w-[480px] h-12 bg-slate-100 border border-border rounded-xl px-4 flex items-center shadow-sm transition-shadow hover:shadow-md">
                    <Search size={18} className="text-text-muted mr-3" />
                    <span className="text-[15px] font-medium text-text-primary">
                      {searchValue}
                      {isTyping && <span className="inline-block w-0.5 h-5 bg-brand ml-0.5 align-middle animate-pulse"></span>}
                      {!searchValue && !isTyping && <span className="text-text-muted/60 font-normal">Search brands, formats and competitors...</span>}
                    </span>
                  </div>
                  <div className="hidden sm:flex h-12 px-4 border border-border hover:border-brand-soft bg-slate-100 hover:bg-surface-blue rounded-xl items-center text-[14px] font-medium text-text-primary gap-2 transition-colors cursor-pointer">
                    <Filter size={16} className="text-brand" /> Filter
                  </div>
                </div>
                
                {/* Find Grid */}
                <div className="flex-1 p-6 overflow-hidden bg-[#FAFAFA]">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      
                      {/* Card 1 - 4:5 */}
                      <div className="col-span-1 row-span-2 relative group cursor-pointer h-[320px]">
                        <div className="absolute inset-0 bg-white rounded-2xl border border-border overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] group-hover:border-border-strong shadow-sm">
                           <img src={workflowAds[0].thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" alt="Ad" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                             <div className="flex items-center gap-2 mb-1">
                                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-black">{workflowAds[0].brand.charAt(0)}</div>
                                <span className="text-white text-[13px] font-medium">{workflowAds[0].brand}</span>
                             </div>
                           </div>
                        </div>
                      </div>

                      {/* Card 2 - 1:1 */}
                      <div className="col-span-1 row-span-1 relative group cursor-pointer h-[200px]">
                        <div className="absolute inset-0 bg-white rounded-2xl border border-border overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] group-hover:border-border-strong shadow-sm">
                           <img src={workflowAds[2].thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" alt="Ad" />
                           <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <div className="bg-white/90 backdrop-blur text-text-primary px-3 py-1.5 rounded-lg text-[13px] font-bold shadow-lg">Review</div>
                           </div>
                        </div>
                      </div>

                      {/* Card 3 - 9:16 */}
                      <div className="col-span-1 row-span-2 relative group cursor-pointer h-[380px]">
                        <div className="absolute inset-0 bg-white rounded-2xl border border-border overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] group-hover:border-border-strong shadow-sm">
                           <img src={workflowAds[1].thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" alt="Ad" />
                           <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 z-10">
                              <Play size={12} className="text-white fill-white ml-0.5" />
                           </div>
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                             <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[11px] font-bold text-black">{workflowAds[1].brand.charAt(0)}</div>
                                <span className="text-white text-[14px] font-medium">{workflowAds[1].brand}</span>
                             </div>
                             <p className="text-white/80 text-[12px] line-clamp-2 leading-relaxed">{workflowAds[1].primaryText}</p>
                           </div>
                        </div>
                      </div>

                      {/* Card 4 - 4:5 */}
                      <div className="col-span-1 row-span-2 relative group cursor-pointer h-[320px]">
                        <div className="absolute inset-0 bg-white rounded-2xl border border-border overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] group-hover:border-border-strong shadow-sm">
                           <img src={workflowAds[3].thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" alt="Ad" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                             <div className="flex items-center gap-2 mb-1">
                                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-black">{workflowAds[3].brand.charAt(0)}</div>
                                <span className="text-white text-[13px] font-medium">{workflowAds[3].brand}</span>
                             </div>
                           </div>
                        </div>
                      </div>

                       {/* Card 5 - 1:1 */}
                       <div className="col-span-1 row-span-1 relative group cursor-pointer h-[200px] mt-[-100px]">
                        <div className="absolute inset-0 bg-white rounded-2xl border border-border overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] group-hover:border-border-strong shadow-sm">
                           <img src={workflowAds[4].thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" alt="Ad" />
                        </div>
                      </div>

                   </div>
                </div>
              </motion.div>
            )}

            {/* UNDERSTAND */}
            {activeTab === 'understand' && (
              <motion.div
                key="understand"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex flex-col md:flex-row bg-[#FAFAFA]"
              >
                {/* Hero Creative Side */}
                <div className="w-full md:w-[55%] h-[300px] md:h-full bg-black relative flex items-center justify-center overflow-hidden">
                   <img src={sampleAd.thumbnail} alt="Creative" className="w-full h-full object-cover opacity-80 blur-[40px] absolute inset-0 scale-110" />
                   <div className="relative h-[90%] max-w-[90%] aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
                      <img src={sampleAd.thumbnail} alt="Creative" className="w-full h-full object-cover" />
                      {sampleAd.format === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 cursor-pointer hover:bg-white/30 transition-colors">
                            <Play size={24} className="text-white fill-white ml-1" />
                          </div>
                        </div>
                      )}
                   </div>
                   {/* Top action bar overlay */}
                   <div className="absolute top-4 right-4 flex items-center gap-2">
                      <button className="w-10 h-10 rounded-full bg-black/50 backdrop-blur border border-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
                         <X size={18} />
                      </button>
                   </div>
                </div>

                {/* Inspector Side */}
                <div className="flex-1 flex flex-col bg-white border-l border-border overflow-y-auto">
                   <div className="p-6 md:p-8">
                      
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-border flex items-center justify-center text-text-primary font-bold text-xl shadow-sm">
                            {sampleAd.brand.charAt(0)}
                          </div>
                          <div>
                            <h2 className="font-bold text-[22px] text-text-primary leading-none mb-1.5">{sampleAd.brand}</h2>
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1.5 text-[13px] font-medium text-brand bg-surface-blue px-2 py-0.5 rounded-md border border-brand/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></span> Active
                              </span>
                              <span className="text-[13px] text-text-muted">Since Aug 12, 2026</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-8">
                        <h4 className="text-[13px] font-bold text-text-muted uppercase tracking-wider mb-3">Primary Text</h4>
                        <div className="bg-slate-100 p-5 rounded-2xl border border-border/60">
                          <p className="text-[15px] text-text-primary leading-relaxed">
                            {sampleAd.primaryText}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div>
                          <h4 className="text-[13px] font-bold text-text-muted uppercase tracking-wider mb-3">Format</h4>
                          <div className="text-[16px] font-bold text-text-primary capitalize">{sampleAd.format}</div>
                        </div>
                        <div>
                          <h4 className="text-[13px] font-bold text-text-muted uppercase tracking-wider mb-3">Destination</h4>
                          <a href="#" className="text-[15px] font-medium text-brand hover:underline flex items-center gap-1">vedabotanics.in <ChevronRight size={14} /></a>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-border flex gap-3">
                         <button className="flex-1 h-12 bg-brand text-white rounded-xl font-bold text-[15px] hover:bg-brand-strong transition-colors flex items-center justify-center gap-2 shadow-md shadow-brand/20">
                           <Heart size={18} /> Save to Swipe File
                         </button>
                         <button className="w-12 h-12 bg-slate-100 border border-border text-text-primary rounded-xl flex items-center justify-center hover:bg-surface-blue hover:border-brand/30 hover:text-brand transition-colors">
                           <Share size={18} />
                         </button>
                      </div>

                   </div>
                </div>
              </motion.div>
            )}

            {/* ORGANIZE */}
            {activeTab === 'organize' && (
              <motion.div
                key="organize"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex flex-col md:flex-row bg-[#FAFAFA]"
              >
                {/* Team Visual Side */}
                <div className="w-full md:w-1/2 h-[250px] md:h-full relative overflow-hidden border-b md:border-b-0 md:border-r border-border">
                  <img src="/brand/creatives/team_collaboration.jpg" alt="Team Collaboration" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <h3 className="text-white text-[26px] font-bold mb-2">Build a shared brain.</h3>
                    <p className="text-white/90 text-[16px] leading-relaxed">Stop losing links in Slack. Curate the best creatives into organized swipe files for your whole team.</p>
                  </div>
                </div>

                {/* Product Action Side */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
                  
                  {/* Mock Swipe File */}
                  <div className="bg-slate-100 rounded-2xl border border-border p-6 shadow-sm mb-8">
                     <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-brand/10 text-brand rounded-lg flex items-center justify-center">
                              <FolderTree size={20} />
                           </div>
                           <h4 className="font-bold text-[16px] text-text-primary">Q3 Campaign Inspiration</h4>
                        </div>
                        <span className="text-[13px] font-medium text-text-muted">12 Assets</span>
                     </div>
                     <div className="flex -space-x-3 mb-6">
                       <img src={workflowAds[0].thumbnail} className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm" alt="Saved" />
                       <img src={workflowAds[1].thumbnail} className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm" alt="Saved" />
                       <img src={workflowAds[2].thumbnail} className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm" alt="Saved" />
                       <div className="w-12 h-12 rounded-full border-2 border-white bg-surface-blue text-brand-strong flex items-center justify-center text-[12px] font-bold z-10 shadow-sm">+9</div>
                     </div>
                     <button className="w-full h-12 bg-white border border-border text-text-primary rounded-xl font-medium text-[14px] hover:border-brand hover:text-brand transition-colors flex items-center justify-center gap-2 shadow-sm">
                       <Plus size={18} /> Add more ads
                     </button>
                  </div>

                  {/* Mock Share Panel */}
                  <div className="bg-white rounded-2xl border border-border p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                     <div className="flex items-center gap-3 mb-4">
                        <Users size={20} className="text-brand" />
                        <h4 className="font-bold text-[16px] text-text-primary">Share with Team</h4>
                     </div>
                     <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                       <div className="flex-1 w-full h-11 bg-slate-100 border border-border rounded-lg px-3 flex items-center text-[13px] text-text-secondary truncate">
                         adshunting.com/share/q3-insp...
                       </div>
                       <button className="w-full sm:w-auto h-11 px-6 bg-text-primary text-white rounded-lg font-medium text-[13px] hover:bg-black transition-colors">
                         Copy
                       </button>
                     </div>
                     <p className="text-[13px] text-text-muted leading-relaxed">Anyone with the link can view this folder without needing an account.</p>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-16 flex justify-center">
          <CTAButton href={authLinks.signUp} size="lg" className="h-14 px-10 text-[16px] shadow-lg shadow-brand/10">
            Start Your 7-Day Free Trial
          </CTAButton>
        </div>

      </LandingContainer>
    </section>
  );
}
