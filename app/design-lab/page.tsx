"use client"

import React, { useState } from "react"
import { ShareCardClassic } from "@/components/share/variations/ShareCardClassic"
import { ShareCardCertificate } from "@/components/share/variations/ShareCardCertificate"
import { ShareCardVector } from "@/components/share/variations/ShareCardVector"
import { ShareCardIllustration } from "@/components/share/variations/ShareCardIllustration"
import { Button } from "@/components/ui/button"

export default function DesignLabPage() {
    const dummyData = {
        title: "Climb Mount Fuji at Sunrise",
        points: 500,
        username: "Traveler_Jane",
        date: new Date().toISOString(),
        photo: null // Can enable photo for "Classic" and "Illustration"
    }

    const [activeTab, setActiveTab] = useState<"classic" | "certificate" | "vector" | "illustration">("classic")

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <header className="max-w-7xl mx-auto mb-12 flex justify-between items-center">
                <h1 className="text-3xl font-bold">🎨 Bucketly Design Lab</h1>
                <div className="flex gap-4">
                    <Button variant={activeTab === "classic" ? "default" : "outline"} onClick={() => setActiveTab("classic")}>Classic</Button>
                    <Button variant={activeTab === "certificate" ? "default" : "outline"} onClick={() => setActiveTab("certificate")}>Certificate</Button>
                    <Button variant={activeTab === "vector" ? "default" : "outline"} onClick={() => setActiveTab("vector")}>Pop Art</Button>
                    <Button variant={activeTab === "illustration" ? "default" : "outline"} onClick={() => setActiveTab("illustration")}>Illustration</Button>
                </div>
            </header>

            <main className="flex justify-center items-center min-h-[800px] overflow-auto">
                <div className="scale-[0.6] origin-top transform-gpu shadow-2xl">
                    {activeTab === "classic" && <ShareCardClassic {...dummyData} />}
                    {activeTab === "certificate" && <ShareCardCertificate {...dummyData} />}
                    {activeTab === "vector" && <ShareCardVector {...dummyData} />}
                    {activeTab === "illustration" && <ShareCardIllustration {...dummyData} />}
                </div>
            </main>

            <footer className="text-center mt-12 text-slate-500">
                Preview Mode • 1080x1080 Canvas Scaled to 60%
            </footer>
        </div>
    )
}
