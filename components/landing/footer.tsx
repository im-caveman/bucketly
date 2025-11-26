"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Github, Twitter } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-background border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <Link href="/" className="flex items-center gap-2">
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
                        <p className="text-muted-foreground max-w-sm">
                            Track your bucket list, compete with friends, and celebrate every milestone.
                            Your journey to achieving your dreams starts here.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <Link
                                href="https://twitter.com"
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Follow us on Twitter"
                            >
                                <Twitter className="w-5 h-5" />
                            </Link>
                            <Link
                                href="https://github.com"
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="View source on GitHub"
                            >
                                <Github className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Links Column */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-foreground">Product</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Log In
                                </Link>
                            </li>
                            <li>
                                <Link href="/auth/signup" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Sign Up
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Community Column */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-foreground">Community</h3>
                        <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Join our subreddit to share your lists and get inspired!
                            </p>
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="w-full gap-2 bg-background hover:bg-accent hover:text-accent-foreground"
                            >
                                <Link
                                    href="https://reddit.com/r/bucketly"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="w-4 h-4"
                                    >
                                        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.561-1.25-1.249-1.25zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                                    </svg>
                                    Join r/bucketly
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Bucketly. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
