// src/components/Header.tsx
import React from 'react';

export default function Header(): React.ReactElement {
    return (
        <header className="text-center mb-12 pt-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 text-white text-3xl font-bold">
                ✦
            </div>

            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3 px-4">
                Your Personalized Engineering Branch Recommendations
            </h1>
        </header>
    )
}

