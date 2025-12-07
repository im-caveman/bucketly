/* eslint-disable @next/next/no-img-element */
import React from "react"
import { ShareCardGenericProps } from "./types"
import { cn } from "@/lib/utils"

export function ShareCardVector({ title, points, username, date, className }: ShareCardGenericProps) {
    return (
        <div
            className={cn("w-[1080px] h-[1080px] relative bg-[#f8f8f8] p-16 flex flex-col justify-between overflow-hidden font-sans text-black", className)}
        >
            {/* Background Pattern - Modern Grid */}
            <div className="absolute inset-0 z-0 opacity-[0.03]"
                style={{
                    backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                    backgroundSize: "40px 40px"
                }}
            />

            {/* Accent Shapes (Abstract/Memphis) */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-yellow-400 rounded-bl-full z-0 opacity-20" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500 rounded-tr-full z-0 opacity-10" />
            <div className="absolute top-1/2 left-20 w-16 h-16 border-4 border-black rounded-full z-0" />
            <div className="absolute top-20 right-1/2 w-16 h-16 bg-pink-400 rotate-45 z-0" />

            <div className="relative z-10 h-full flex flex-col justify-between border-4 border-black bg-white p-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">

                {/* Header */}
                <div className="flex justify-between items-center border-b-4 border-black pb-8">
                    <div className="flex items-center gap-4">
                        <img src="/logo.svg" alt="Bucketly" className="w-16 h-16" />
                        <span className="text-5xl font-extrabold tracking-tight">Bucketly</span>
                    </div>
                    <div className="px-6 py-2 bg-black text-white text-2xl font-bold uppercase tracking-widest rounded-full">
                        Goal Completed
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col justify-center gap-8 py-8">
                    <span className="text-2xl font-mono text-slate-500 uppercase tracking-widest text-center">
                        Achievement Unlocked
                    </span>
                    <h1 className="text-8xl font-black text-center leading-[1.1] uppercase break-words max-w-[800px] mx-auto bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 pb-4">
                        {title}
                    </h1>

                    <div className="mx-auto flex items-center justify-center gap-4 mt-8">
                        <div className="w-4 h-4 bg-black rounded-full" />
                        <div className="w-[100px] h-[4px] bg-black" />
                        <div className="w-4 h-4 bg-black rounded-full" />
                    </div>
                </div>

                {/* Footer Data */}
                <div className="grid grid-cols-2 gap-8 border-t-4 border-black pt-8">
                    <div className="flex flex-col gap-2">
                        <span className="text-xl font-bold uppercase text-slate-400 tracking-wider">Achiever</span>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-black text-white rounded-lg flex items-center justify-center text-3xl font-bold">
                                {username.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-4xl font-bold">{username}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                        <span className="text-xl font-bold uppercase text-slate-400 tracking-wider">Reward</span>
                        <div className="flex items-end gap-2">
                            <span className="text-6xl font-black text-green-500">+{points}</span>
                            <span className="text-2xl font-bold mb-3">PTS</span>
                        </div>
                    </div>
                </div>

                {/* Timestamp absolute */}
                <div className="absolute bottom-4 right-4 text-sm font-mono text-slate-400">
                    {date ? new Date(date).toLocaleDateString() : new Date().toLocaleDateString()}
                </div>
            </div>
        </div>
    )
}
