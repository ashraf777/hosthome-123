
"use client"

import * as React from "react"
import Link from "next/link"
import { Search, User, Menu, Home, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

import { BookingCart } from "./BookingCart"
import { useBooking } from "@/providers/booking-provider"

export function GuestLayout({ children }) {
    const { cart, setIsCartOpen } = useBooking()

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <BookingCart />
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-primary p-2 rounded-lg">
                            <Home className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-primary hidden sm:inline-block">
                            HostHome
                        </span>
                    </Link>

                    {/* Search Summary (Placeholder for dynamic interaction) */}
                    {/* <div className="hidden md:flex items-center border rounded-full px-4 py-2 shadow-sm hover:shadow-md transition cursor-pointer gap-4">
                        <span className="text-sm font-semibold border-r pr-4">Anywhere</span>
                        <span className="text-sm font-semibold border-r pr-4">Any week</span>
                        <span className="text-sm text-muted-foreground mr-2">Add guests</span>
                        <div className="bg-primary p-2 rounded-full">
                            <Search className="h-3 w-3 text-primary-foreground" />
                        </div>
                    </div> */}


                    {/* User Nav */}
                    <div className="flex items-center gap-4">
                        {/* <Link href="/dashboard" className="hidden sm:block text-sm font-semibold hover:bg-accent px-4 py-2 rounded-full transition">
                            Host your home
                        </Link> */}

                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative flex items-center border rounded-full p-2 gap-2 hover:shadow-md transition cursor-pointer"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-background">
                                    {cart.length}
                                </span>
                            )}
                        </button>

                        {/* <div className="flex items-center border rounded-full p-2 gap-2 hover:shadow-md transition cursor-pointer">
                            <Menu className="h-4 w-4" />
                            <div className="bg-muted-foreground/20 rounded-full p-1">
                                <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </div> */}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t py-12 bg-muted/30">
                {/* <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-bold mb-4">Support</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>Help Center</li>
                            <li>HostCover</li>
                            <li>Supporting people with disabilities</li>
                            <li>Cancellation options</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold mb-4">Community</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>Disaster relief housing</li>
                            <li>Combatting discrimination</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold mb-4">Hosting</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>Host your home</li>
                            <li>HostCover for Hosts</li>
                            <li>Hosting resources</li>
                            <li>Community forum</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold mb-4">HostHome</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>Newsroom</li>
                            <li>Learn about new features</li>
                            <li>Careers</li>
                            <li>Investors</li>
                        </ul>
                    </div>
                </div> */}
                <div className="container mx-auto px-4 mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>© 2026 HostHome, Inc. · Privacy · Terms · Sitemap</p>
                    <div className="flex gap-4">
                        <span>English (US)</span>
                        <span>$ USD</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
