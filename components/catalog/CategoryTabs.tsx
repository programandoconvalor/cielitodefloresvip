"use client";
import React from 'react';

type Category = { id: string; label: string };

type Props = {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
};

export default function CategoryTabs({ categories, activeId, onSelect }: Props) {
  return (
    <div className="overflow-x-auto py-4">
      <div className="mx-auto flex max-w-[1460px] gap-3 px-4 md:px-6 lg:px-8">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition ${c.id === activeId ? 'bg-black text-[#C8A95B] ring-1 ring-[#C8A95B]' : 'bg-black text-[#AFAFAF] border border-[#8E6B35]/20 hover:border-[#C8A95B] hover:text-[#C8A95B]'}`}
            style={{borderColor: c.id === activeId ? '#C8A95B' : 'rgba(142,107,53,0.12)'}}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
