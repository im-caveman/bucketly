/* eslint-disable @next/next/no-img-element */
import React from "react"
import { ShareCardGenericProps } from "./types"
import { cn } from "@/lib/utils"

export function ShareCardClassic({ title, points, username, photo, date, className }: ShareCardGenericProps) {
    return (
        <div
            className={cn("w-[1080px] h-[1080px] relative overflow-hidden flex flex-col items-center justify-center p-20 text-white font-mono", className)}
            style={{
                background: "linear-gradient(135deg, #2e1065 0%, #0f172a 100%)",
            }}
        >
            {/* Decorative Blobs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[150px] opacity-30" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-600 rounded-full blur-[150px] opacity-30" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center gap-10 w-full max-w-4xl">
                {/* Logo Section */}
                <div className="flex items-center gap-4 mb-4 opacity-90">
                    <img src="/logo.svg" alt="Bucketly Logo" className="w-20 h-20" />
                    <span className="text-5xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>Bucketly</span>
                </div>

                <div className="flex items-center gap-4 bg-white/10 px-8 py-4 rounded-full border border-white/20 backdrop-blur-md shadow-lg">
                    <span className="text-5xl">🏆</span>
                    <span className="text-3xl font-bold tracking-wider uppercase">Achievement Unlocked</span>
                </div>

                <h1 className="text-8xl font-black leading-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-300 to-white drop-shadow-2xl line-clamp-3"
                    style={{
                        textShadow: "0 4px 30px rgba(0,0,0,0.5)",
                        fontFamily: "var(--font-rebels, sans-serif)",
                        textTransform: "uppercase",
                        letterSpacing: "0.02em"
                    }}
                >
                    {title}
                </h1>

                <div className="flex items-center gap-10 mt-8 bg-black/30 p-8 rounded-3xl backdrop-blur-sm border border-white/10 w-full justify-between">
                    <div className="flex items-center gap-5 text-4xl text-slate-200">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold shadow-lg ring-4 ring-white/10">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold">{username}</span>
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="text-lg text-slate-400 uppercase tracking-widest font-bold">Earned</span>
                        <div className="text-6xl font-black text-amber-400 drop-shadow-md">
                            +{points} PTS
                        </div>
                    </div>
                </div>

                <div className="text-slate-400 font-mono text-xl mt-4">
                    {date ? new Date(date).toLocaleDateString(undefined, { dateStyle: "long" }) : new Date().toLocaleDateString(undefined, { dateStyle: "long" })}
                </div>
            </div>
        </div>
    )
}
