import Link from "next/link"
import Image from "next/image"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Simple Standalone Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Image
                            src="/logo.svg"
                            alt="Bucketly logo"
                            width={32}
                            height={32}
                            className="w-8 h-8"
                        />
                        <span className="font-display text-xl font-bold text-foreground">
                            Bucketly
                        </span>
                    </Link>
                    <Button asChild variant="ghost" size="sm" className="gap-2">
                        <Link href="/">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </Button>
                </div>
            </header>

            <main className="flex-grow py-12 px-4 sm:px-6 md:px-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="space-y-4 border-b border-border pb-8">
                        <h1 className="font-display text-4xl md:text-5xl font-bold">Terms of Service</h1>
                        <p className="text-muted-foreground text-lg">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
                        <section>
                            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                By accessing and using Bucketly, you accept and agree to be bound by the terms and provision of this agreement.
                                In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable
                                to such services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Bucketly provides users with tools to create, track, and share bucket lists. You are responsible for obtaining
                                access to the Service and that access may involve third party fees (such as Internet service provider or airtime charges).
                                You are responsible for those fees.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">3. User Conduct</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                You agree to not use the Service to:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                                <li>Upload, post, email, transmit or otherwise make available any content that is unlawful, harmful, threatening, abusive, harassing, tortuous, defamatory, vulgar, obscene, libelous, invasive of another&apos;s privacy, hateful, or racially, ethnically or otherwise objectionable.</li>
                                <li>Impersonate any person or entity, including, but not limited to, a Bucketly official, forum leader, guide or host, or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
                                <li>Forge headers or otherwise manipulate identifiers in order to disguise the origin of any content transmitted through the Service.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                The Service and its original content, features and functionality are and will remain the exclusive property of Bucketly and its licensors.
                                The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
                                Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Bucketly.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">5. Termination</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever,
                                including without limitation if you breach the Terms. All provisions of the Terms which by their nature should survive
                                termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
