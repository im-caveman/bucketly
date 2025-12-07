/* eslint-disable @next/next/no-img-element */
import React from "react"
import { ShareCardGenericProps } from "./types"
import { cn } from "@/lib/utils"

export function ShareCardIllustration({ title, points, username, photo, rank, date, className }: ShareCardGenericProps) {
    return (
        <div
            className={cn("w-[1080px] h-[1080px] relative bg-[#f0f4f8] flex flex-col items-center justify-between p-16 overflow-hidden font-sans", className)}
        >
            {/* Artistic Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-[#d3e4ff] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
            <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#e6d3ff] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
            <div className="absolute bottom-[-10%] left-[20%] w-[800px] h-[800px] bg-[#ffd3e6] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

            <div className="relative z-10 w-full h-full bg-white/60 backdrop-blur-xl rounded-[60px] border border-white/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] flex flex-col items-center p-12 py-16">

                {/* Header with Larger Bucketly Branding */}
                <div className="flex items-center gap-5 mb-10 opacity-90 transform hover:scale-105 transition-transform duration-300 shrink-0">
                    <img src="/logo.svg" alt="Bucketly" className="w-20 h-20" />
                    <span className="text-5xl font-extrabold tracking-tight text-slate-800" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>Bucketly</span>
                </div>

                {/* Main Photo Card - Compressed Size */}
                <div className="relative w-full max-w-[700px] aspect-[4/3] bg-white rounded-[32px] shadow-2xl p-4 rotate-1 transform hover:rotate-0 transition-transform duration-500 mb-8 shrink-0">
                    <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-100 relative">
                        {photo ? (
                            <img src={photo} alt={title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                                <span className="text-2xl">No photo available</span>
                            </div>
                        )}

                        {/* Overlay Title - Compact */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8 pt-24">
                            <h1 className="text-4xl font-black text-white leading-tight drop-shadow-lg line-clamp-2">
                                {title}
                            </h1>
                        </div>
                    </div>

                    {/* Points Sticker - Adjusted */}
                    <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#FFD700] rounded-full flex flex-col items-center justify-center shadow-xl border-4 border-white rotate-12 text-[#5c4d00]">
                        <div className="text-5xl font-black leading-none">+{points}</div>
                        <div className="text-sm font-bold uppercase tracking-wider">Points</div>
                    </div>
                </div>

                {/* Footer with Ranking, User, Timestamp */}
                <div className="mt-auto w-full flex justify-between items-end px-8 max-w-[850px]">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl font-bold font-mono shadow-lg">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <span className="text-4xl font-bold text-slate-900 tracking-tight">{username}</span>
                                {rank && (
                                    <div className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-lg font-bold border border-blue-200">
                                        Top {rank}%
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-lg uppercase tracking-widest text-slate-500 font-bold">Global Explorer</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                <span className="text-lg font-medium text-slate-400">
                                    {date ? new Date(date).toLocaleDateString(undefined, { dateStyle: "long" }) : new Date().toLocaleDateString(undefined, { dateStyle: "long" })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
