import React from 'react';
import { LandingContainer } from '../layout/LandingContainer';
import { CTAButton } from '../ui/CTAButton';
import { authLinks } from '@/data/landing/config';
import { Search, Filter, Play } from 'lucide-react';
import { workflowAds } from '@/data/landing/workflowAds';

export function DiscoverAdsSection() {
  return (
    <section id="discover" className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(37,99,235,0.03), transparent 60%)'
        }}
      />
      <LandingContainer className="text-center flex flex-col items-center relative z-10">
        
        <div className="max-w-[800px] mb-12 md:mb-16">
          <h2 className="text-[36px] md:text-[48px] lg:text-[56px] leading-[1.05] font-bold tracking-tight text-text-primary text-balance mb-6">
            Search the market, not ten different tabs.
          </h2>
          <p className="text-[18px] md:text-[20px] text-text-secondary max-w-[600px] mx-auto leading-relaxed">
            Instantly discover relevant creatives using advanced filters like brand, format, category, and active status.
          </p>
        </div>

        <div className="w-full max-w-[1100px] bg-slate-50 border border-border shadow-[0_20px_60px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden mb-12 p-4 md:p-8">
          <div className="w-full h-[450px] md:h-[600px] bg-slate-50 border border-border shadow-sm rounded-xl overflow-hidden flex flex-col relative">
            <div className="h-14 border-b border-border bg-white flex items-center px-4 justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="mx-auto bg-slate-100 border border-border rounded-lg px-24 py-1.5 text-[13px] font-medium text-text-primary flex items-center gap-2 shadow-sm">
                <Search size={14} className="text-text-muted" /> app.adshunting.com/discover
              </div>
              <div className="flex gap-2 opacity-0 md:opacity-100">
                 <div className="w-4 h-4"></div>
              </div>
            </div>
            
            <div className="flex-1 p-6 flex gap-6">
               <div className="w-48 hidden md:flex flex-col gap-4">
                 <div className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-2">Filters</div>
                 <div className="h-9 bg-white border border-border rounded-lg flex items-center px-3 text-[13px] font-medium text-text-primary shadow-sm"><Filter size={14} className="mr-2 text-text-muted" /> Brand: All</div>
                 <div className="h-9 bg-white border border-border rounded-lg flex items-center px-3 text-[13px] font-medium text-text-primary shadow-sm"><Filter size={14} className="mr-2 text-text-muted" /> Format: Image</div>
                 <div className="h-9 bg-white border border-border rounded-lg flex items-center px-3 text-[13px] font-medium text-text-primary shadow-sm"><Filter size={14} className="mr-2 text-text-muted" /> Status: Active</div>
               </div>
               
               <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4">
                 {workflowAds.slice(0, 3).map((ad, i) => (
                   <div key={i} className="bg-white border border-border rounded-xl overflow-hidden aspect-[4/5] relative shadow-sm group">
                     <img src={ad.thumbnail} alt={ad.brand} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                     {ad.format === 'video' && (
                       <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                         <Play size={10} className="text-white fill-white ml-0.5" />
                       </div>
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <span className="text-white text-[13px] font-bold">{ad.brand}</span>
                     </div>
                   </div>
                 ))}
                 {/* Fade out bottom row to suggest infinite scroll */}
                 {workflowAds.slice(3, 6).map((ad, i) => (
                   <div key={i + 3} className="bg-white border border-border rounded-xl overflow-hidden aspect-[4/5] relative shadow-sm opacity-40">
                     <img src={ad?.thumbnail || workflowAds[0].thumbnail} alt="More ads" className="w-full h-full object-cover" />
                   </div>
                 ))}
               </div>
            </div>
            {/* Fade overlay for bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
          </div>
        </div>

        <CTAButton href={authLinks.signUp} size="lg" className="h-12 md:h-14 px-8">
          Start discovering ads <span className="ml-2">→</span>
        </CTAButton>
      </LandingContainer>
    </section>
  );
}
