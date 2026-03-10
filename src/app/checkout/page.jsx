
"use client"

import * as React from "react"
import { useBooking } from "@/providers/booking-provider"
import { GuestLayout } from "@/components/guest/GuestLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ChevronLeft, CheckCircle2, CreditCard, Wallet, Building2, ShieldCheck, Loader2 } from "lucide-react"
import Link from "next/link"
import { guestApi } from "@/services/guest-api"

export default function CheckoutPage() {
    const { cart, total, nights, dateRange, weekdayNights, weekendNights, clearCart } = useBooking()
    const [formData, setFormData] = React.useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        ic_passport_no: "",
        address: "",
        city: "",
        state: "",
        nationality: "",
        emergency_contact_name: "",
        emergency_contact_number: ""
    })
    const [isSubmitted, setIsSubmitted] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [error, setError] = React.useState(null)

    const handleInputChange = (e) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (cart.length === 0) return;

        setIsSubmitting(true)
        setError(null)

        try {
            if (!dateRange || !dateRange.from || !dateRange.to) {
                throw new Error("Missing stay dates. Please go back and select a date range.");
            }

            const parsedRooms = cart.map(item => {
                const wPrice = Number(item.weekday_price || item.price || 0)
                const wePrice = Number(item.weekend_price || wPrice)
                const roomTotal = (wPrice * weekdayNights) + (wePrice * weekendNights)

                return {
                    property_id: item.propertyId || item.property_id,
                    room_type_id: item.id,
                    nights: nights, // Used by the backend to calculate ADR
                    raw_price: wPrice, // The base nightly rate for tracking
                    price: roomTotal   // The total cost for all nights combined
                }
            })

            const bookingData = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                ic_passport_no: formData.ic_passport_no,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                nationality: formData.nationality,
                emergency_contact_name: formData.emergency_contact_name,
                emergency_contact_number: formData.emergency_contact_number,
                check_in_date: dateRange.from.toISOString().split('T')[0],
                check_out_date: dateRange.to.toISOString().split('T')[0],
                guests: 1, // You could pull this from context if tracked globally
                total_price: total,
                rooms: parsedRooms
            };

            await guestApi.createBooking(bookingData);

            setIsSubmitted(true)
            clearCart()
        } catch (err) {
            console.error("Booking failed:", err);
            setError(err.message || "Failed to submit booking. We apologize, but this room may have just been booked by another guest.");
        } finally {
            setIsSubmitting(false)
        }
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

                                <h3 className="text-lg font-bold mt-6 mb-2">Identity & Address (Optional)</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="ic_passport_no">IC / Passport Number</Label>
                                    <Input id="ic_passport_no" placeholder="e.g. 900101-14-5555" value={formData.ic_passport_no} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Full Address</Label>
                                    <Input id="address" placeholder="123 Example Street" value={formData.address} onChange={handleInputChange} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" placeholder="Kuala Lumpur" value={formData.city} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State / Province</Label>
                                        <Input id="state" placeholder="Wilayah Persekutuan" value={formData.state} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nationality">Nationality</Label>
                                    <Input id="nationality" placeholder="Malaysian" value={formData.nationality} onChange={handleInputChange} />
                                </div>

                                <h3 className="text-lg font-bold mt-6 mb-2">Emergency Contact (Optional)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="emergency_contact_name">Contact Name</Label>
                                        <Input id="emergency_contact_name" placeholder="Jane Doe" value={formData.emergency_contact_name} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="emergency_contact_number">Contact Number</Label>
                                        <Input id="emergency_contact_number" type="tel" placeholder="+60 12-345 6789" value={formData.emergency_contact_number} onChange={handleInputChange} />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <h3 className="text-lg font-bold mb-4">Payment</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                                        <div className="border-2 border-primary bg-primary/5 rounded-xl p-4 flex flex-col items-center gap-2 cursor-not-allowed opacity-80">
                                            <CreditCard className="text-primary" size={24} />
                                            <span className="text-xs font-bold text-center">Credit / Debit Card</span>
                                        </div>
                                        <div className="border-2 border-muted rounded-xl p-4 flex flex-col items-center gap-2 cursor-not-allowed grayscale opacity-50">
                                            <Wallet className="text-muted-foreground" size={24} />
                                            <span className="text-xs font-bold text-center">PayPal</span>
                                        </div>
                                        <div className="border-2 border-muted rounded-xl p-4 flex flex-col items-center gap-2 cursor-not-allowed grayscale opacity-50">
                                            <Building2 className="text-muted-foreground" size={24} />
                                            <span className="text-xs font-bold text-center">FPX / Bank</span>
                                        </div>
                                    </div>
                                    <div className="bg-muted/30 border rounded-lg p-4 mb-6 flex items-start gap-3">
                                        <ShieldCheck className="text-muted-foreground mt-0.5" size={18} />
                                        <p className="text-xs text-muted-foreground">
                                            <span className="font-bold block mb-1">Demo Mode Active</span>
                                            This is a demonstration environment. No actual payment will be processed and no sensitive data will be stored.
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="bg-destructive/15 text-destructive font-semibold p-4 rounded-md mb-6 text-sm animate-in fade-in slide-in-from-top-2 border border-destructive/30">
                                            {error}
                                        </div>
                                    )}

                                    <Button type="submit" size="lg" className="w-full py-6 text-xl" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Processing...</span>
                                        ) : (
                                            "Confirm Booking"
                                        )}
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
                                {cart.map(item => {
                                    const wPrice = Number(item.weekday_price || item.price || 0);
                                    const wePrice = Number(item.weekend_price || wPrice);

                                    return (
                                        <div key={item.id} className="flex flex-col gap-2 border-b pb-4 last:border-0 last:pb-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground">{item.propertyName}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col text-sm text-muted-foreground mt-2 pl-2 border-l-2">
                                                {weekdayNights > 0 && (
                                                    <div className="flex justify-between">
                                                        <span>${wPrice} x {weekdayNights} weekday night{weekdayNights !== 1 ? 's' : ''}</span>
                                                        <span>${(wPrice * weekdayNights).toFixed(2)}</span>
                                                    </div>
                                                )}
                                                {weekendNights > 0 && (
                                                    <div className="flex justify-between mt-1">
                                                        <span>${wePrice} x {weekendNights} weekend night{weekendNights !== 1 ? 's' : ''}</span>
                                                        <span>${(wePrice * weekendNights).toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
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
