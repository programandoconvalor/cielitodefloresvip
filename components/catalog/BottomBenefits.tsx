"use client";
import React from 'react';

export default function BottomBenefits() {
  return (
    <div className="mt-8 rounded-lg bg-gradient-to-r from-black via-zinc-900 to-black p-6 text-white shadow-lg">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <svg className="h-8 w-8 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="font-serif text-lg font-semibold">Envío a todo México</p>
            <p className="text-sm text-white/70">Entrega rápida y segura en empaques premium</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm text-white/70">
          <div className="flex flex-col">
            <span className="font-semibold text-white">Atención VIP</span>
            <span className="text-xs">Chat y WhatsApp</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white">Pago seguro</span>
            <span className="text-xs">Tarjeta y efectivo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
