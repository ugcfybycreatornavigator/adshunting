'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LandingContainer } from '@/components/landing/layout/LandingContainer';
import { workflowAds } from '@/data/landing/workflowAds';
import { Search, SlidersHorizontal, Video, Play, ExternalLink, Bookmark, Check, Share2, Copy, BarChart3, Tags, FolderOpen, FolderPlus, Lock, Globe } from 'lucide-react';

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

function NavItem({ icon, label, isActive }: { icon: React.ReactNode, label: string, isActive: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
      isActive ? "bg-brand/10 text-brand" : "text-white/60 hover:text-white hover:bg-white/5"
    )}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

function WorkflowMockup({ activeStep }: { activeStep: number }) {
  const pumaAd = workflowAds[1];
  const [searchStep, setSearchStep] = useState(0);
  const [shareType, setShareType] = useState<'private' | 'public'>('public');
  const [shareGenerated, setShareGenerated] = useState(false);

  // Auto-typing animation for Discover step
  useEffect(() => {
    let t1: NodeJS.Timeout, t2: NodeJS.Timeout;
    if (activeStep === 0) {
      t1 = setTimeout(() => setSearchStep(1), 600);
      t2 = setTimeout(() => setSearchStep(2), 1400);
    } else {
      setSearchStep(2);
    }
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [activeStep]);

  // Auto-share demonstration for Share step
  useEffect(() => {
    let t1: NodeJS.Timeout;
    if (activeStep === 4) {
      // automatically generate link after 1.5s if not manually clicked
      t1 = setTimeout(() => setShareGenerated(true), 1500);
    } else {
      setShareGenerated(false);
    }
    return () => clearTimeout(t1);
  }, [activeStep]);

  const filteredAds = searchStep === 2 ? workflowAds.filter(ad => ad.brand === 'Puma') : workflowAds.slice(0, 3);

  return (
    <div className="w-full h-full bg-[#fcfcfa] rounded-[16px] md:rounded-[24px] border border-[#e4e8e2] shadow-[0_12px_40px_rgba(0,0,0,0.08)] overflow-hidden flex relative">
      
      {/* Dark Sidebar */}
      <div className="hidden sm:flex w-[200px] lg:w-[220px] bg-[#1a1b1e] border-r border-[#2d2e33] flex-col shrink-0 z-30">
        <div className="p-5 flex items-center gap-2.5 text-white font-bold text-[16px] mb-2">
           <div className="w-6 h-6 bg-brand rounded-md flex items-center justify-center"><Search size={14} className="text-white" /></div>
           AdsHunting
        </div>
        <div className="px-3 flex-1 flex flex-col gap-1">
          <NavItem icon={<Search size={16}/>} label="Discover Ads" isActive={activeStep === 0 || activeStep === 1} />
          <NavItem icon={<BarChart3 size={16}/>} label="Competitors" isActive={activeStep === 2} />
          <NavItem icon={<Tags size={16}/>} label="Brands" isActive={false} />
          <div className="h-[1px] bg-[#2d2e33] my-2 mx-2"></div>
          <NavItem icon={<Bookmark size={16}/>} label="Swipe Files" isActive={activeStep === 3} />
          <NavItem icon={<Share2 size={16}/>} label="Shared Ads" isActive={activeStep === 4} />
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#fcfcfa]">
        
        {/* State 0: Discover Grid */}
        <motion.div 
          className="absolute inset-0 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: activeStep === 0 ? 1 : 0, 
            pointerEvents: activeStep === 0 ? 'auto' : 'none',
            zIndex: activeStep === 0 ? 20 : 0
          }}
          transition={{ duration: 0.4 }}
        >
           {/* Topbar */}
           <div className="px-5 py-4 border-b border-[#e4e8e2] bg-white flex items-center justify-between shrink-0">
             <div className="flex items-center gap-3">
               <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all w-[240px]", searchStep > 0 ? "border-brand ring-1 ring-brand/20 bg-white" : "border-[#e4e8e2] bg-[#fcfcfa]")}>
                 <Search size={14} className="text-text-muted" />
                 <div className="text-[13px]">
                   {searchStep === 0 && <span className="text-text-muted">Search keywords, brands...</span>}
                   {searchStep > 0 && <span className="text-text-primary font-medium">Puma<span className={cn("inline-block w-[1.5px] h-3.5 bg-brand ml-0.5 align-middle", searchStep === 1 && "animate-pulse", searchStep >= 2 && "hidden")}></span></span>}
                 </div>
               </div>
               <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e4e8e2] rounded-lg text-[13px] font-medium text-text-secondary"><SlidersHorizontal size={14} /> Filters</button>
             </div>
           </div>

           <div className="p-5 flex-1 overflow-y-auto">
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
               {filteredAds.map((demo, idx) => (
                  <div key={idx} className={cn("rounded-xl border border-[#e4e8e2] overflow-hidden relative flex flex-col bg-white", searchStep < 2 && "opacity-0 translate-y-4", searchStep === 2 && "animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards", idx === 1 && "delay-100", idx === 2 && "delay-200")}>
                    <div className="aspect-[4/5] relative bg-[#f4f5f3]">
                      <img src={demo.thumbnail} className="w-full h-full object-cover" alt="" />
                      <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md rounded-md p-1.5"><Video size={12} className="text-white" /></div>
                      <div className="absolute top-2 left-2 bg-white/95 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-text-primary uppercase tracking-wider">{demo.brand}</div>
                    </div>
                    <div className="p-3 border-t border-[#e4e8e2]">
                       <p className="text-[12px] text-text-secondary line-clamp-2 leading-snug">{demo.primaryText}</p>
                       <div className="mt-2 flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                         <span className="text-[10px] font-medium text-text-muted uppercase">Active</span>
                       </div>
                    </div>
                  </div>
               ))}
             </div>
           </div>
        </motion.div>

        {/* State 1: Review Panel (Ad Detail) */}
        <motion.div 
          className="absolute inset-0 bg-white flex flex-col"
          initial={{ opacity: 0, x: 20 }}
          animate={{ 
            opacity: activeStep === 1 ? 1 : 0, 
            pointerEvents: activeStep === 1 ? 'auto' : 'none',
            x: activeStep === 1 ? 0 : 20,
            zIndex: activeStep === 1 ? 20 : 0
          }}
          transition={{ duration: 0.4 }}
        >
          <div className="px-5 py-3 border-b border-[#e4e8e2] bg-[#fcfcfa] shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-text-muted uppercase tracking-widest">Ad Details</span>
            </div>
            <button className="flex items-center gap-1.5 text-[13px] font-bold text-text-secondary hover:text-brand"><ExternalLink size={14} /> Open Live</button>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left: Media */}
            <div className="w-full lg:w-[45%] bg-[#f4f5f3] border-b lg:border-b-0 lg:border-r border-[#e4e8e2] p-6 flex items-center justify-center relative">
              <div className="w-full max-w-[280px] aspect-[4/5] rounded-xl overflow-hidden shadow-md relative group">
                 <img src={pumaAd.thumbnail} className="w-full h-full object-cover" alt="" />
                 <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                   <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-lg"><Play size={20} className="text-text-primary ml-1" /></div>
                 </div>
              </div>
            </div>

            {/* Right: Metadata */}
            <div className="w-full lg:w-[55%] p-6 overflow-y-auto bg-white space-y-6">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-[#fcfcfa] border border-[#e4e8e2] flex items-center justify-center text-[14px] font-bold text-brand">P</div>
                 <div>
                   <h3 className="text-[15px] font-bold text-text-primary">{pumaAd.brand}</h3>
                   <span className="text-[12px] text-text-muted flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span> Active since Aug 12</span>
                 </div>
               </div>

               <div>
                 <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Primary Copy</h4>
                 <div className="p-3 bg-[#fcfcfa] border border-[#e4e8e2] rounded-lg text-[13px] text-text-secondary leading-relaxed">
                   {pumaAd.primaryText}
                 </div>
               </div>

               <div className="bg-[#eef4ec] border border-[#d2dfcb] rounded-lg p-4 relative overflow-hidden">
                 <h4 className="text-[11px] font-bold text-brand uppercase tracking-wider mb-3">AdsHunting Signals</h4>
                 <div className="grid grid-cols-2 gap-4 relative z-10">
                   <div>
                     <span className="block text-[11px] text-brand/70 mb-1">Creative Fatigue</span>
                     <span className="text-[14px] font-bold text-brand">{pumaAd.signals?.creativeFatigue}</span>
                   </div>
                   <div>
                     <span className="block text-[11px] text-brand/70 mb-1">Scaling Trend</span>
                     <span className="text-[14px] font-bold text-brand">{pumaAd.signals?.scaling}</span>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </motion.div>

        {/* State 2: Research (Competitors & Brands) */}
        <motion.div 
          className="absolute inset-0 bg-[#fcfcfa] flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: activeStep === 2 ? 1 : 0, 
            pointerEvents: activeStep === 2 ? 'auto' : 'none',
            y: activeStep === 2 ? 0 : 20,
            zIndex: activeStep === 2 ? 20 : 0
          }}
          transition={{ duration: 0.4 }}
        >
          <div className="px-5 py-4 border-b border-[#e4e8e2] bg-white shrink-0">
             <h2 className="text-[18px] font-bold text-text-primary">Competitor Intelligence</h2>
             <p className="text-[13px] text-text-secondary mt-1">Analyzing structural creative patterns for Puma.</p>
          </div>
          <div className="p-5 flex-1 overflow-y-auto">
            
            {/* Intelligence Card */}
            <div className="bg-white border border-[#e4e8e2] rounded-xl p-5 mb-5 shadow-sm">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white text-[20px] font-black">P</div>
                <div>
                  <h3 className="text-[16px] font-bold text-text-primary">Puma</h3>
                  <div className="flex items-center gap-3 text-[12px] text-text-secondary mt-1">
                    <span className="flex items-center gap-1"><Video size={12}/> 72% Video</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#10b981] rounded-full"></span> 45 Active</span>
                  </div>
                </div>
              </div>
              <div className="h-[1px] bg-[#e4e8e2] mb-5"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#fcfcfa] rounded-lg border border-[#e4e8e2]">
                  <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">Top Format</span>
                  <span className="text-[14px] font-bold text-text-primary">Short-form Video (9:16)</span>
                </div>
                <div className="p-3 bg-[#fcfcfa] rounded-lg border border-[#e4e8e2]">
                  <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">Primary Angle</span>
                  <span className="text-[14px] font-bold text-text-primary">Performance & Speed</span>
                </div>
              </div>
            </div>

            {/* Related Creatives */}
            <h4 className="text-[13px] font-bold text-text-primary mb-3">Recent Winning Creatives</h4>
            <div className="grid grid-cols-3 gap-3">
               {workflowAds.slice(1, 4).map((demo, idx) => (
                  <div key={idx} className="rounded-lg border border-[#e4e8e2] overflow-hidden aspect-square bg-[#f4f5f3] relative group">
                    <img src={demo.thumbnail} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  </div>
               ))}
            </div>

          </div>
        </motion.div>

        {/* State 3: Save (Swipe Files) */}
        <motion.div 
          className="absolute inset-0 bg-[#fcfcfa] flex flex-col"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ 
            opacity: activeStep === 3 ? 1 : 0, 
            pointerEvents: activeStep === 3 ? 'auto' : 'none',
            scale: activeStep === 3 ? 1 : 0.98,
            zIndex: activeStep === 3 ? 20 : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-5 py-4 border-b border-[#e4e8e2] bg-white flex items-center justify-between shrink-0">
             <h2 className="text-[18px] font-bold text-text-primary">Swipe Files</h2>
             <button className="px-3 py-1.5 bg-brand text-white rounded-lg text-[13px] font-bold flex items-center gap-1.5 shadow-sm"><FolderPlus size={14} /> New Folder</button>
          </div>
          <div className="flex flex-1 overflow-hidden">
            
            {/* Folder List */}
            <div className="w-[180px] border-r border-[#e4e8e2] bg-white p-3 flex flex-col gap-1 hidden sm:flex">
              <div className="px-3 py-2 bg-[#f4f5f3] text-text-primary rounded-lg text-[13px] font-bold flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-2"><FolderOpen size={14} className="text-text-muted" /> Saved Ads</div>
                <span className="text-[11px] text-text-muted font-medium bg-white px-1.5 py-0.5 rounded shadow-sm border border-[#e4e8e2]">12</span>
              </div>
              <div className="px-3 py-2 text-text-secondary hover:bg-[#fcfcfa] rounded-lg text-[13px] font-medium flex items-center justify-between group cursor-pointer transition-colors">
                <div className="flex items-center gap-2"><FolderOpen size={14} className="text-text-muted opacity-60" /> Competitors</div>
                <span className="text-[11px] text-text-muted font-medium bg-white px-1.5 py-0.5 rounded shadow-sm border border-[#e4e8e2] opacity-0 group-hover:opacity-100 transition-opacity">5</span>
              </div>
            </div>

            {/* Folder Content */}
            <div className="flex-1 p-5 overflow-y-auto">
              <h3 className="text-[15px] font-bold text-text-primary mb-4">Saved Ads</h3>
              <div className="grid grid-cols-2 gap-4">
                 {workflowAds.map((demo, idx) => (
                    <div key={idx} className="rounded-xl border border-[#e4e8e2] bg-white p-2 shadow-sm">
                      <div className="aspect-video bg-[#f4f5f3] rounded-lg overflow-hidden relative mb-2">
                        <img src={demo.thumbnail} className="w-full h-full object-cover object-top opacity-90" alt="" />
                      </div>
                      <div className="px-1 pb-1 flex items-center justify-between">
                         <span className="text-[12px] font-bold text-text-primary">{demo.brand}</span>
                         <span className="text-[10px] text-text-muted uppercase font-medium">{demo.format}</span>
                      </div>
                    </div>
                 ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* State 4: Share */}
        <motion.div 
          className="absolute inset-0 bg-[#fcfcfa] flex flex-col items-center justify-center p-6"
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ 
            opacity: activeStep === 4 ? 1 : 0, 
            filter: activeStep === 4 ? "blur(0px)" : "blur(4px)",
            pointerEvents: activeStep === 4 ? 'auto' : 'none',
            zIndex: activeStep === 4 ? 20 : 0
          }}
          transition={{ duration: 0.4 }}
        >
           <div className="w-full max-w-[400px] bg-white border border-[#e4e8e2] rounded-2xl shadow-xl overflow-hidden relative z-10 flex flex-col">
              
              {!shareGenerated ? (
                <div className="p-6">
                  <h3 className="text-[18px] font-bold text-text-primary mb-1">Share Creative</h3>
                  <p className="text-[13px] text-text-secondary mb-6">Choose how you want to share this ad.</p>
                  
                  <div className="space-y-3 mb-6">
                    <button 
                      onClick={() => setShareType('private')}
                      className={cn("w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors", shareType === 'private' ? "border-brand bg-brand/5 ring-1 ring-brand/20" : "border-[#e4e8e2] hover:bg-[#fcfcfa]")}
                    >
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", shareType === 'private' ? "bg-brand text-white" : "bg-[#f4f5f3] text-text-secondary")}>
                         <Lock size={14} />
                      </div>
                      <div>
                        <span className="block text-[14px] font-bold text-text-primary">Private</span>
                        <span className="block text-[12px] text-text-secondary mt-0.5">Only invited team members can view.</span>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => setShareType('public')}
                      className={cn("w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors", shareType === 'public' ? "border-brand bg-brand/5 ring-1 ring-brand/20" : "border-[#e4e8e2] hover:bg-[#fcfcfa]")}
                    >
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", shareType === 'public' ? "bg-brand text-white" : "bg-[#f4f5f3] text-text-secondary")}>
                         <Globe size={14} />
                      </div>
                      <div>
                        <span className="block text-[14px] font-bold text-text-primary">Public Link</span>
                        <span className="block text-[12px] text-text-secondary mt-0.5">Anyone with the link can view.</span>
                      </div>
                    </button>
                  </div>
                  
                  <button onClick={() => setShareGenerated(true)} className="w-full py-2.5 bg-brand text-white rounded-lg text-[13px] font-bold shadow-sm">
                    Create {shareType === 'private' ? 'Private' : 'Public'} Link
                  </button>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 text-center">
                  <div className="h-[80px] bg-gradient-to-br from-[#1a1b1e] to-[#2d2e33] flex items-center justify-center relative overflow-hidden">
                    <Share2 size={32} className="text-white/20 absolute -right-2 -bottom-2 scale-150 transform rotate-12" />
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg relative z-10">
                      <Check size={24} className="text-brand" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-[18px] font-bold text-text-primary mb-2">
                      {shareType === 'private' ? 'Private' : 'Public'} Link Created
                    </h3>
                    <p className="text-[13px] text-text-secondary mb-6 leading-relaxed">
                      {shareType === 'private' ? 'Restricted link generated securely.' : 'Anyone with this link can view the ad creative.'}
                    </p>
                    <div className="flex items-center gap-2 p-2 bg-[#fcfcfa] border border-[#e4e8e2] rounded-lg mb-4 text-left">
                       <div className="flex-1 overflow-hidden flex items-center gap-2">
                         {shareType === 'private' ? <Lock size={12} className="text-text-muted shrink-0"/> : <Globe size={12} className="text-text-muted shrink-0"/>}
                         <p className="text-[12px] font-mono text-text-secondary truncate pr-1">adshunting.com/share/x9f2...</p>
                       </div>
                       <button className="px-3 py-1.5 bg-brand text-white rounded-md text-[12px] font-bold flex items-center gap-1.5 shrink-0"><Copy size={12}/> Copied</button>
                    </div>
                  </div>
                </div>
              )}
           </div>

           {/* Decorative background elements */}
           <div className="absolute inset-0 z-0 opacity-30 pointer-events-none flex flex-col overflow-hidden p-4">
             <div className="grid grid-cols-2 gap-4 blur-sm opacity-50 scale-105">
                {workflowAds.map((demo, idx) => (
                    <div key={idx} className="rounded-xl border border-[#e4e8e2] bg-white p-2">
                      <div className="aspect-video bg-[#e4e8e2] rounded-lg relative mb-2"></div>
                      <div className="h-4 bg-[#e4e8e2] rounded w-1/2"></div>
                    </div>
                 ))}
             </div>
           </div>
        </motion.div>

      </div>
    </div>
  );
}

// --- Mobile UI Fallbacks ---
function MobileMockup({ stepId }: { stepId: string }) {
  const ad = workflowAds[1]; // Puma
  
  switch(stepId) {
    case 'discover':
      return (
        <div className="w-full bg-[#fcfcfa] border border-[#e4e8e2] rounded-xl overflow-hidden shadow-sm">
           <div className="px-4 py-3 border-b border-[#e4e8e2] bg-white flex gap-2">
             <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-[#fcfcfa] border border-[#e4e8e2] rounded-md">
               <Search size={14} className="text-text-muted" />
               <span className="text-[13px] font-medium text-text-primary">Puma</span>
             </div>
           </div>
           <div className="p-4 grid grid-cols-2 gap-3">
             {[1,2].map(i => (
               <div key={i} className="aspect-[4/5] bg-[#f4f5f3] rounded-lg relative overflow-hidden border border-[#e4e8e2]">
                 <img src={ad.thumbnail} className="w-full h-full object-cover" alt="" />
                 <div className="absolute top-1 left-1 bg-white/95 rounded px-1 py-0.5 text-[9px] font-bold">PUMA</div>
               </div>
             ))}
           </div>
        </div>
      );
    case 'review':
      return (
        <div className="w-full bg-white border border-[#e4e8e2] rounded-xl overflow-hidden shadow-sm">
           <div className="aspect-[4/5] bg-[#f4f5f3] relative">
             <img src={ad.thumbnail} className="w-full h-full object-cover" alt="" />
             <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
               <div className="w-10 h-10 bg-white/95 rounded-full flex items-center justify-center"><Play size={16} className="ml-0.5"/></div>
             </div>
           </div>
           <div className="p-4">
             <div className="flex items-center gap-2 mb-3">
               <div className="w-6 h-6 bg-[#f2f6f0] border border-[#d2dfcb] rounded text-[10px] font-bold text-brand flex items-center justify-center">P</div>
               <span className="text-[14px] font-bold">Puma</span>
             </div>
             <p className="text-[12px] text-text-secondary bg-[#fcfcfa] p-2 rounded-lg border border-[#e4e8e2] leading-relaxed">
               {ad.primaryText}
             </p>
           </div>
        </div>
      );
    case 'research':
      return (
        <div className="w-full bg-[#fcfcfa] border border-[#e4e8e2] rounded-xl p-4 shadow-sm">
           <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center font-bold">P</div>
             <div>
               <h4 className="text-[14px] font-bold">Puma</h4>
               <p className="text-[12px] text-text-secondary">45 Active Ads</p>
             </div>
           </div>
           <div className="grid grid-cols-2 gap-2">
             <div className="bg-white border border-[#e4e8e2] p-2 rounded-lg text-center">
                <span className="block text-[10px] text-text-muted uppercase font-bold mb-1">Top Format</span>
                <span className="text-[12px] font-bold">Video (9:16)</span>
             </div>
             <div className="bg-white border border-[#e4e8e2] p-2 rounded-lg text-center">
                <span className="block text-[10px] text-text-muted uppercase font-bold mb-1">Primary Angle</span>
                <span className="text-[12px] font-bold">Performance</span>
             </div>
           </div>
        </div>
      );
    case 'save':
      return (
        <div className="w-full bg-[#fcfcfa] border border-[#e4e8e2] rounded-xl overflow-hidden shadow-sm">
           <div className="p-3 border-b border-[#e4e8e2] bg-white flex items-center justify-between">
             <span className="text-[14px] font-bold">Saved Ads</span>
             <span className="text-[11px] bg-[#f4f5f3] px-2 py-0.5 rounded">12</span>
           </div>
           <div className="p-4 grid grid-cols-2 gap-3">
             <div className="aspect-[4/5] bg-[#eef4ec] rounded-lg border border-[#d2dfcb] flex items-center justify-center flex-col gap-2">
               <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center"><Check size={16}/></div>
               <span className="text-[11px] font-bold text-brand">Saved</span>
             </div>
             <div className="aspect-[4/5] bg-white rounded-lg border border-[#e4e8e2]">
                <img src={workflowAds[2].thumbnail} className="w-full h-full object-cover opacity-60 rounded-lg" alt="" />
             </div>
           </div>
        </div>
      );
    case 'share':
      return (
        <div className="w-full bg-white border border-[#e4e8e2] rounded-xl p-5 shadow-sm text-center">
           <div className="w-10 h-10 bg-brand text-white rounded-full flex items-center justify-center mx-auto mb-3">
             <Check size={16} />
           </div>
           <h4 className="text-[15px] font-bold mb-1">Public Link Created</h4>
           <p className="text-[12px] text-text-secondary mb-4">Anyone with the link can view.</p>
           <div className="flex items-center justify-center gap-2 p-2 bg-[#fcfcfa] border border-[#e4e8e2] rounded-lg">
              <span className="text-[11px] font-mono text-text-muted truncate">adshunting.com/share/x9f2...</span>
           </div>
        </div>
      );
    default: return null;
  }
}

function StepItem({ index, step, isActive, onActivate }: { index: number, step: typeof steps[0], isActive: boolean, onActivate: (index: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "-45% 0px -45% 0px" });

  useEffect(() => {
    if (isInView && !isActive) {
      onActivate(index);
    }
  }, [isInView, isActive, index, onActivate]);

  return (
    <div 
      ref={ref}
      className={cn(
        "flex flex-col py-12 md:py-20 transition-opacity duration-300 cursor-pointer",
        index === 0 && "pt-0 md:pt-4",
        isActive ? "opacity-100" : "opacity-30 hover:opacity-50"
      )}
      onClick={() => onActivate(index)}
    >
      <span className="text-brand font-bold text-[12px] tracking-widest uppercase mb-4 block">
        {step.label}
      </span>
      <h3 className="text-[28px] md:text-[34px] font-bold text-text-primary leading-[1.15] mb-4 text-balance">
        {step.title}
      </h3>
      <p className="text-[16px] md:text-[17px] text-text-secondary leading-relaxed">
        {step.description}
      </p>

      {/* Lightweight Mobile Mockup */}
      <div className="block lg:hidden mt-8 w-full transition-all">
        {isActive && <MobileMockup stepId={step.id} />}
      </div>
    </div>
  );
}

export function WorkflowSection() {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStepActivate = React.useCallback((index: number) => {
    setActiveStep((current) => {
      if (current === index) return current;
      return index;
    });
  }, []);

  return (
    <section id="workflow" className="py-16 md:py-24 bg-[#ffffff] border-t border-[#e4e8e2] relative">
      <LandingContainer>
        
        {/* Section Header */}
        <div className="max-w-[700px] mb-12 md:mb-16 text-center md:text-left">
          <h2 className="text-[34px] md:text-[44px] lg:text-[50px] leading-[1.1] font-bold tracking-tight text-text-primary text-balance">
            How AdsHunting turns ad chaos into creative intelligence.
          </h2>
          <p className="text-[16px] md:text-[20px] text-text-secondary mt-5 max-w-[600px] leading-relaxed">
            A faster workflow for finding, reviewing, saving, and sharing winning ads with your team.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 relative" ref={containerRef}>
          
          {/* Left Column: Steps (Scrollable) */}
          <div className="w-full lg:w-[45%] xl:w-5/12 flex flex-col relative z-10 lg:pb-[30vh]">
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
                index={index}
                step={step} 
                isActive={activeStep === index} 
                onActivate={handleStepActivate} 
              />
            ))}
          </div>

          {/* Right Column: Sticky Mockup */}
          <div className="hidden lg:block lg:w-[55%] xl:w-7/12 relative">
             <div className="sticky top-28 h-[500px] xl:h-[600px] w-full">
                <WorkflowMockup activeStep={activeStep} />
             </div>
          </div>

        </div>
      </LandingContainer>
    </section>
  );
}
