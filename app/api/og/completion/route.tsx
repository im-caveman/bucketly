import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)

        // Dynamic params
        const title = searchParams.get('title') || 'Bucket List Item'
        const name = searchParams.get('user') || 'Bucketly User'
        const points = searchParams.get('points') || '0'
        const photo = searchParams.get('photo') // Optional background

        // Fonts - we'll use standard system fonts for simplicity in this MVP 
        // or load Google Fonts if strictly required, but standard fonts work well for speed.

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#0f172a', // slate-900
                        backgroundImage: photo
                            ? `linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url(${photo})`
                            : 'linear-gradient(to bottom right, #2e1065, #0f172a)', // purple-950 to slate-900
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        color: 'white',
                        fontFamily: 'sans-serif',
                        position: 'relative',
                    }}
                >
                    {/* Decorative elements */}
                    <div style={{
                        position: 'absolute',
                        top: -100,
                        left: -100,
                        width: 400,
                        height: 400,
                        backgroundColor: '#7c3aed',
                        borderRadius: '50%',
                        filter: 'blur(100px)',
                        opacity: 0.3,
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: -100,
                        right: -100,
                        width: 400,
                        height: 400,
                        backgroundColor: '#db2777',
                        borderRadius: '50%',
                        filter: 'blur(100px)',
                        opacity: 0.3,
                    }} />

                    {/* Content Container */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 20,
                        padding: '40px 60px',
                        textAlign: 'center',
                        zIndex: 10,
                        maxWidth: '90%',
                    }}>
                        {/* Celebration Badge */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            background: 'rgba(255, 255, 255, 0.1)',
                            padding: '12px 24px',
                            borderRadius: 50,
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            marginBottom: 20,
                        }}>
                            <div style={{ fontSize: 32 }}>🏆</div>
                            <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '0.05em' }}>ACHIEVEMENT UNLOCKED</div>
                        </div>

                        {/* Title */}
                        <div style={{
                            fontSize: 72,
                            fontWeight: 800,
                            lineHeight: 1.1,
                            background: 'linear-gradient(to right, #e879f9, #ffffff)', // fuchsia-400 to white
                            backgroundClip: 'text',
                            color: 'transparent',
                            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        }}>
                            {title}
                        </div>

                        {/* User & Points */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 20,
                            marginTop: 10,
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                fontSize: 28,
                                color: '#cbd5e1', // slate-300
                            }}>
                                <img
                                    width="40"
                                    height="40"
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`}
                                    style={{ borderRadius: '50%' }}
                                    alt="avatar"
                                />
                                <span>{name}</span>
                            </div>

                            <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.3)' }} />

                            <div style={{
                                fontSize: 28,
                                fontWeight: 700,
                                color: '#fbbf24', // amber-400
                            }}>
                                +{points} Points
                            </div>
                        </div>

                    </div>

                    {/* Footer Branding */}
                    <div style={{
                        position: 'absolute',
                        bottom: 40,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        opacity: 0.8
                    }}>
                        <div style={{ fontWeight: 900, fontSize: 28, letterSpacing: '-0.02em' }}>Bucketly</div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        )
    } catch (e: any) {
        console.log(`${e.message}`)
        return new Response(`Failed to generate the image`, {
            status: 500,
        })
    }
}
