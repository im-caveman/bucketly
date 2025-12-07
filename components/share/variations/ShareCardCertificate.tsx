/* eslint-disable @next/next/no-img-element */
import React from "react"
import { ShareCardGenericProps } from "./types"
import { cn } from "@/lib/utils"

export function ShareCardCertificate({ title, points, username, date, className }: ShareCardGenericProps) {
    return (
        <div
            className={cn("w-[1080px] h-[1080px] relative bg-[#fdfbf7] text-slate-900 flex flex-col items-center justify-between p-24 pb-32", className)}
        >
            {/* Ornate Border */}
            <div className="absolute inset-8 border-[16px] border-double border-[#d4af37] pointer-events-none" />
            <div className="absolute inset-10 border-[2px] border-[#d4af37] pointer-events-none opacity-50" />

            {/* Corner Patterns */}
            <div className="absolute top-8 left-8 w-32 h-32 border-t-[16px] border-l-[16px] border-[#d4af37]" />
            <div className="absolute top-8 right-8 w-32 h-32 border-t-[16px] border-r-[16px] border-[#d4af37]" />
            <div className="absolute bottom-8 left-8 w-32 h-32 border-b-[16px] border-l-[16px] border-[#d4af37]" />
            <div className="absolute bottom-8 right-8 w-32 h-32 border-b-[16px] border-r-[16px] border-[#d4af37]" />

            <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-4xl w-full h-full justify-center">

                {/* Header */}
                <div className="flex flex-col items-center mt-8">
                    <img src="/logo.svg" alt="Bucketly" className="w-[100px] h-[100px] filter sepia-[.3]" />
                    <span className="text-3xl font-bold tracking-widest text-[#d4af37] uppercase mt-4 font-serif">Bucketly</span>
                    <h2 className="text-5xl font-serif italic text-slate-500 tracking-wider mt-8">Certificate of Completion</h2>
                    <div className="w-[600px] h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent my-6" />
                </div>

                {/* Main Text */}
                <div className="flex flex-col items-center gap-4 flex-1 justify-center">
                    <p className="text-3xl font-serif text-slate-600">This is to certify that</p>

                    <h3 className="text-7xl font-serif font-bold text-slate-900 border-b-2 border-slate-300 pb-4 px-12 min-w-[500px]">
                        {username}
                    </h3>

                    <p className="text-3xl font-serif text-slate-600 mt-6">has officially completed the goal</p>

                    <h1 className="text-8xl font-serif font-black text-[#d4af37] uppercase tracking-wide leading-tight mt-4 drop-shadow-sm max-w-[950px] line-clamp-3">
                        {title}
                    </h1>
                </div>

                {/* Footer / Signatures */}
                <div className="w-full flex justify-between items-end mt-12 px-12 relative">
                    <div className="flex flex-col items-center">
                        <div className="text-4xl font-serif font-bold text-slate-900 border-b-2 border-slate-400 pb-2 mb-2 w-48 text-center italic font-handwriting">
                            Bucketly Team
                        </div>
                        <span className="text-xl font-serif italic text-slate-500">Authorized Signature</span>
                    </div>

                    {/* Seal - Centered Absolutely */}
                    <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-4">
                        <div className="w-56 h-56 rounded-full bg-[#d4af37] flex items-center justify-center text-white shadow-2xl relative">
                            <div className="absolute inset-3 border-2 border-white/50 rounded-full border-dashed" />
                            <div className="text-center transform -rotate-12">
                                <div className="text-xl font-bold tracking-widest uppercase">Official</div>
                                <div className="text-5xl font-black font-serif my-1">SEAL</div>
                                <div className="text-sm tracking-widest uppercase mt-1">Bucketly.space</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="text-3xl font-serif text-slate-900 mb-2 border-b-2 border-slate-400 pb-2 w-48 text-center">
                            {date ? new Date(date).toLocaleDateString() : new Date().toLocaleDateString()}
                        </div>
                        <span className="text-xl font-serif italic text-slate-500">Date</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
