import React from 'react';
import { LandingContainer } from '../layout/LandingContainer';
import { workflowAds } from '@/data/landing/workflowAds';
import { Heart, Share, Play } from 'lucide-react';

export function ReviewResearchSection() {
  const sampleAd1 = workflowAds[2]; // Aura Sound (Image)
  const sampleAd2 = workflowAds[1]; // Veda Botanics (Video)

  return (
    <section className="py-24 md:py-32 bg-slate-50 border-t border-border overflow-hidden relative">
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(37,99,235,0.04), transparent 70%)'
        }}
      />
      <LandingContainer className="flex flex-col gap-32 relative z-10">
        
        {/* Review Section */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="w-full lg:w-[55%] rounded-2xl bg-white border border-border shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col sm:flex-row h-auto sm:h-[420px]">
            <div className="w-full sm:w-[45%] h-[300px] sm:h-full relative overflow-hidden bg-black">
              <img src={sampleAd1.thumbnail} alt={sampleAd1.brand} className="w-full h-full object-cover opacity-80 blur-[20px] absolute inset-0 scale-110" />
              <div className="absolute inset-4 sm:inset-6 bg-black rounded-lg overflow-hidden shadow-2xl border border-white/10">
                 <img src={sampleAd1.thumbnail} alt={sampleAd1.brand} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="w-full sm:w-[55%] p-6 md:p-8 flex flex-col bg-slate-50 border-l border-border overflow-y-auto">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-12 h-12 rounded-xl bg-slate-100 border border-border flex items-center justify-center font-bold text-text-primary shadow-sm">{sampleAd1.brand.charAt(0)}</div>
                 <div>
                   <h3 className="font-bold text-[18px] text-text-primary leading-none mb-1">{sampleAd1.brand}</h3>
                   <span className="text-[12px] text-text-muted">Active Ad • Format: Image</span>
                 </div>
               </div>
               
               <div className="bg-slate-100 p-4 rounded-xl border border-border mb-6">
                 <p className="text-[14px] text-text-primary leading-relaxed">
                   {sampleAd1.primaryText}
                 </p>
               </div>

               <div className="grid grid-cols-2 gap-3 mb-auto">
                 <div className="bg-white p-3 border border-border rounded-lg shadow-sm">
                   <div className="text-[11px] font-bold text-text-muted uppercase mb-1">Fatigue</div>
                   <div className="text-[14px] font-bold text-text-primary">{sampleAd1.signals?.creativeFatigue}</div>
                 </div>
                 <div className="bg-white p-3 border border-border rounded-lg shadow-sm">
                   <div className="text-[11px] font-bold text-text-muted uppercase mb-1">Scaling</div>
                   <div className="text-[14px] font-bold text-text-primary">{sampleAd1.signals?.scaling}</div>
                 </div>
               </div>

               <div className="pt-6 flex gap-3 mt-4">
                 <button className="flex-1 h-10 bg-brand text-white rounded-lg font-medium text-[14px] hover:bg-brand-strong transition-colors flex items-center justify-center gap-2 shadow-sm">
                   <Heart size={16} /> Save
                 </button>
                 <button className="w-10 h-10 bg-white border border-border text-text-primary rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors shadow-sm">
                   <Share size={16} />
                 </button>
               </div>
            </div>
          </div>
          <div className="w-full lg:w-[45%] max-w-[500px]">
            <h2 className="text-[32px] md:text-[40px] font-bold text-text-primary mb-6 leading-[1.1]">
              Understand the creative before copying the idea.
            </h2>
            <p className="text-[18px] text-text-secondary leading-relaxed">
              Every ad has a strategy. Review the full creative, read the original caption, check the active status, and see exactly when it started running.
            </p>
          </div>
        </div>

        {/* Research Section (Reverse layout) */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
          <div className="w-full lg:w-[50%] rounded-2xl bg-white border border-border shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8">
            <div className="flex items-center justify-between mb-8">
               <div className="w-16 h-16 bg-slate-100 border border-border rounded-xl text-text-primary font-bold flex items-center justify-center text-xl shadow-sm">V</div>
               <div className="h-8 px-3 bg-surface-blue text-brand-strong border border-brand/20 font-medium text-[13px] rounded-full flex items-center">Veda Botanics Overview</div>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[13px] font-medium text-text-primary mb-2">
                  <span>Image Formats</span>
                  <span>60%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 border border-border/50 rounded-full overflow-hidden">
                  <div className="h-full bg-brand w-[60%]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-[13px] font-medium text-text-primary mb-2">
                  <span>Video Formats</span>
                  <span>30%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 border border-border/50 rounded-full overflow-hidden">
                  <div className="h-full bg-brand w-[30%] opacity-80"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[13px] font-medium text-text-primary mb-2">
                  <span>Carousel Formats</span>
                  <span>10%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 border border-border/50 rounded-full overflow-hidden">
                  <div className="h-full bg-brand w-[10%] opacity-50"></div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-border flex gap-4">
               <div className="w-20 h-24 bg-border/20 rounded-lg overflow-hidden border border-border">
                  <img src={sampleAd2.thumbnail} alt={`${sampleAd2.brand} ad preview`} className="w-full h-full object-cover" />
               </div>
               <div className="w-20 h-24 bg-border/20 rounded-lg overflow-hidden border border-border relative">
                  <img src={sampleAd1.thumbnail} alt={`${sampleAd1.brand} video ad preview`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20"><Play size={12} className="text-white fill-white" /></div>
               </div>
               <div className="w-20 h-24 bg-slate-100 border border-border rounded-lg flex items-center justify-center text-[12px] font-medium text-text-muted">
                 +12 more
               </div>
            </div>
          </div>
          <div className="w-full lg:w-[50%] max-w-[500px]">
            <h2 className="text-[32px] md:text-[40px] font-bold text-text-primary mb-6 leading-[1.1]">
              See what competitors keep testing.
            </h2>
            <p className="text-[18px] text-text-secondary leading-relaxed">
              Analyze a brand&apos;s entire creative output. Find patterns in their format mix and see what visual themes they rely on. 
            </p>
          </div>
        </div>

      </LandingContainer>
    </section>
  );
}
