
"use client"

import * as React from "react"
import { useBooking } from "@/providers/booking-provider"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Trash2, ShoppingCart, ArrowRight } from "lucide-react"
import Link from "next/link"

export function BookingCart() {
    const { cart, removeFromCart, total, isCartOpen, setIsCartOpen } = useBooking()

    return (
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetContent className="w-full sm:max-w-md flex flex-col">
                <SheetHeader className="border-b pb-4">
                    <SheetTitle className="flex items-center gap-2 text-2xl">
                        <ShoppingCart className="h-6 w-6" />
                        Your Selection
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-6">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                            <div className="bg-muted p-6 rounded-full text-muted-foreground">
                                <ShoppingCart className="h-12 w-12" />
                            </div>
                            <p className="text-muted-foreground">Your cart is empty.</p>
                            <Button variant="outline" onClick={() => setIsCartOpen(false)}>Continue browsing</Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {cart.map((item) => (
                                <div key={item.id} className="flex gap-4 border-b pb-4">
                                    <div className="flex-1">
                                        <h4 className="font-bold">{item.name}</h4>
                                        <p className="text-sm text-muted-foreground mb-1">{item.propertyName}</p>
                                        <span className="text-sm font-semibold">${item.weekday_price || item.price} <span className="text-xs font-normal">/ night</span></span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-destructive"
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cart.length > 0 && (
                    <SheetFooter className="border-t pt-6 flex-col gap-4">
                        <div className="w-full flex justify-between items-center mb-2">
                            <span className="text-lg font-bold">Total (per night)</span>
                            <span className="text-2xl font-bold">${total}</span>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <Link href="/checkout" className="w-full" onClick={() => setIsCartOpen(false)}>
                                <Button className="w-full py-6 text-lg font-bold flex gap-2">
                                    Confirm Booking <ArrowRight size={20} />
                                </Button>
                            </Link>
                            <Button variant="ghost" onClick={() => setIsCartOpen(false)} className="w-full">
                                Continue selection
                            </Button>
                        </div>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    )
}
