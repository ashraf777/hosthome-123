
"use client"

import * as React from "react"
import { useBooking } from "@/providers/booking-provider"
import { GuestLayout } from "@/components/guest/GuestLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ChevronLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
    const { cart, total, clearCart } = useBooking()
    const [formData, setFormData] = React.useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: ""
    })
    const [isSubmitted, setIsSubmitted] = React.useState(false)

    const handleInputChange = (e) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // In a real app, we'd send data to the API here.
        setIsSubmitted(true)
        clearCart()
    }

    if (isSubmitted) {
        return (
            <GuestLayout>
                <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
                    <div className="bg-primary/10 p-6 rounded-full text-primary mb-6">
                        <CheckCircle2 size={64} />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
                    <p className="text-muted-foreground max-w-md mb-8">
                        Thank you for your booking, {formData.firstName}. We've sent a confirmation email to {formData.email}.
                    </p>
                    <Link href="/">
                        <Button size="lg">Return to Home</Button>
                    </Link>
                </div>
            </GuestLayout>
        )
    }

    if (cart.length === 0) {
        return (
            <GuestLayout>
                <div className="container mx-auto px-4 py-20 text-center">
                    <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                    <Link href="/">
                        <Button>Explore Properties</Button>
                    </Link>
                </div>
            </GuestLayout>
        )
    }

    return (
        <GuestLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-2 mb-8">
                    <Link href="/" className="hover:text-primary transition">
                        <ChevronLeft size={20} />
                    </Link>
                    <h1 className="text-3xl font-bold">Confirm and pay</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Form */}
                    <div className="space-y-8">
                        <section>
                            <h2 className="text-xl font-bold mb-4">Your details</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input id="firstName" placeholder="John" required value={formData.firstName} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input id="lastName" placeholder="Doe" required value={formData.lastName} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="john@example.com" required value={formData.email} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" type="tel" placeholder="+60 12-345 6789" required value={formData.phone} onChange={handleInputChange} />
                                </div>

                                <div className="pt-6">
                                    <h3 className="text-lg font-bold mb-4">Payment</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        This is a demo. No actual payment will be processed.
                                    </p>
                                    <Button type="submit" size="lg" className="w-full py-6 text-xl">
                                        Confirm Booking
                                    </Button>
                                </div>
                            </form>
                        </section>
                    </div>

                    {/* Right: Summary */}
                    <div>
                        <Card className="sticky top-28">
                            <CardHeader>
                                <CardTitle>Booking Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {cart.map(item => (
                                    <div key={item.id} className="flex justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-bold">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.propertyName}</p>
                                        </div>
                                        <span className="font-semibold">${item.weekday_price}</span>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter className="flex-col items-stretch border-t pt-6 gap-2">
                                <div className="flex justify-between items-center text-lg">
                                    <span>Subtotal</span>
                                    <span>${total}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-muted-foreground">
                                    <span>Service fee</span>
                                    <span>$0.00</span>
                                </div>
                                <div className="flex justify-between items-center text-xl font-bold mt-2">
                                    <span>Total (USD)</span>
                                    <span>${total}</span>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </GuestLayout>
    )
}
