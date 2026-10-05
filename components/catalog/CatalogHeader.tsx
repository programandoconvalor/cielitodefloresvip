"use client";
import React from 'react';
import { AiOutlineStar } from 'react-icons/ai';
import { GiRoyalLove } from 'react-icons/gi';
import { FaRss } from 'react-icons/fa';
import { AiOutlineHeart } from 'react-icons/ai';

type Category = { id: string; label: string; };
type Branding = {
  businessType: string;
  businessName: string;
  sectionLabel: string;
  logoSrc: string;
};

type Props = {
  title?: string;
  branding: Branding;
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
};

export default function CatalogHeader({ title, branding, categories, activeId, onSelect }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#5a4520] bg-[#050505] backdrop-blur-sm" style={{boxShadow:'0 6px 18px rgba(0,0,0,0.6)'}}>
      <div className="mx-auto flex max-w-[1460px] items-center justify-between gap-2 px-4 py-3 md:gap-4 md:px-10 md:py-7">
        <div className="flex min-w-0 items-center gap-2 md:gap-4">
          <div className="h-12 w-12 shrink-0 overflow-hidden border border-[#7b6230] bg-black shadow-[0_0_0_1px_rgba(212,175,55,0.08)] md:h-[78px] md:w-[78px]">
            <img src={branding.logoSrc} alt="logo" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#c4a45e] md:text-[12px] md:tracking-[0.42em]">{branding.businessType}</p>
            <h1 className="truncate text-[1.35rem] font-semibold leading-none text-[#fbf6eb] md:text-[clamp(1.5rem,5vw,3.2rem)]">{branding.businessName}</h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-10">
          <div className="hidden items-center gap-3 text-[#d4b46b] md:flex">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3 18h18l-1 3H4l-1-3zm1.4-9.7L8.5 12l3.4-6 3.6 6 4.1-3.7 1.4 7.7H3l1.4-7.7z"/></svg>
            <span className="text-[1.15rem] font-medium uppercase tracking-[0.08em]">Exclusivo</span>
          </div>
        </div>
      </div>
      {/* Pills and collection title for desktop */}
      <div className="mx-auto max-w-[1460px] px-4 pb-3 md:px-10 md:pb-6">
        <div className="mt-2 flex items-center justify-between md:mt-4">
          <div>
            <h5 className="font-serif  text-[#fbf6eb]" style={{fontSize: 'clamp(1.25rem, 5vw, 1.25rem)'}}>Colección VIP</h5>
            <div className="mt-2 h-0.5 w-14 rounded bg-[#6a5221] md:mt-3" />
          </div>
          <div className="hidden md:flex items-center gap-3">
            {/* decorative right-side crown label to match mock */}
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#d4b46b]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l1.9 4.3L18.5 8l-3.8 2.9L15 15l-3-2-3 2 .3-4.1L3.5 8l4.6-1.7L12 2z"/></svg>
              EXCLUSIVO
            </span>
          </div>
        </div>

        <div className="mt-2 px-0 md:mt-4">
          <div className="mt-1 flex w-full gap-2 overflow-x-auto no-scrollbar py-0.5 md:mt-2 md:gap-3 md:py-2">
            <div className="flex items-center justify-start gap-2 pl-0 whitespace-nowrap md:gap-3 md:pl-2">
              {categories.map((cat) => {
                const isActive = cat.id === activeId;
                // Choose an icon per category id; fallback to generic icon
                let Icon: React.ComponentType<any> = FaRss;
                if (cat.id === 'all') Icon = AiOutlineStar;
                else if (cat.id === 'rosas') Icon = GiRoyalLove;
                else if (cat.id === 'gerberas') Icon = FaRss;
                else if (cat.id === 'corazones') Icon = AiOutlineHeart;
                else if (cat.id === 'girasoles') Icon = FaRss;
                else if (cat.id === 'combinados') Icon = FaRss;

                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelect(cat.id)}
                    className={`inline-flex items-center gap-1.5 rounded-[20px] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap md:gap-2 md:px-3 md:py-2 md:text-xs lg:text-sm ${isActive ? 'border-2 border-[#d0b56a] bg-[#070707] text-[#ffffff] shadow-[inset_0_0_0_1px_rgba(208,181,106,0.06)]' : 'border border-[#2e2a28] bg-[#0b0b0b] text-[#d9c79a]'}`}
                    style={{cursor: 'pointer'}}
                  >
                    <Icon className="h-3.5 w-3.5 text-[#d9c79a] md:h-4 md:w-4" />
                    <span className="whitespace-nowrap">{cat.label.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
