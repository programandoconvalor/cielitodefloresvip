"use client";
import React from 'react';

type Props = {
  search: string;
  onChange: (v: string) => void;
  onClear: () => void;
  placeholder?: string;
};

export default function CatalogSearch({ search, onChange, onClear, placeholder }: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-3 rounded-3xl border border-[#8E6B35] bg-[#050505] px-6 py-5 shadow-[0_18px_60px_rgba(0,0,0,0.75)]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          aria-label="Buscar en el catálogo"
          className="w-full bg-transparent text-xl md:text-2xl font-serif font-semibold text-[#F5F5F5] placeholder-[#AFAFAF] outline-none"
          placeholder={placeholder ?? 'Buscar productos...'}
          value={search}
          onChange={(e) => onChange(e.target.value)}
          style={{letterSpacing: '-0.01em'}}
        />
        {search.length > 0 && (
          <button aria-label="Limpiar" onClick={onClear} className="text-amber-300 hover:text-amber-100">
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
