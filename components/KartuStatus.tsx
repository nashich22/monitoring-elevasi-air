"use client";
import React from "react";

interface StatusCardsProps {
    level: number;
}

export default function KartuStatus({ level }: StatusCardsProps) {
    const isNormal = level <= 50;
    const isWaspada = level > 50 && level <= 75;
    const isBahaya = level > 75;

    const cards = [
        {
            title: "Normal",
            active: isNormal,
            color: "text-green-600",
            bg: "bg-green-50/50",
            border: "border-green-100",
            iconBg: "bg-green-500",
        },
        {
            title: "Waspada",
            active: isWaspada,
            color: "text-amber-600",
            bg: "bg-amber-50/50",
            border: "border-amber-100",
            iconBg: "bg-amber-500",
        },
        {
            title: "Bahaya",
            active: isBahaya,
            color: "text-red-600",
            bg: "bg-red-50/50",
            border: "border-red-100",
            iconBg: "bg-red-500",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {cards.map((card, idx) => (
                <div
                    key={idx}
                    className={`relative p-6 rounded-xl border flex items-center justify-between shadow-sm transition-all duration-300 ${card.active ? `${card.bg} ${card.border} border-2 ring-1 ring-offset-0` : "bg-white border-gray-100 opacity-70"
                        }`}
                >
                    <div className="flex flex-col">
                        <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${card.active ? card.color : "text-gray-400"}`}>
                            Status
                        </span>
                        <h3 className={`text-2xl font-bold ${card.active ? card.color : "text-gray-400"}`}>
                            {card.title}
                        </h3>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${card.active ? card.iconBg : "bg-gray-200"}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    {card.active && (
                        <div className="absolute top-2 right-2 flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${card.iconBg}`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${card.iconBg}`}></span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}



