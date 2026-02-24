
"use client"

import * as React from "react"

const BookingContext = React.createContext(undefined)

export function BookingProvider({ children }) {
    const [cart, setCart] = React.useState([])
    const [isCartOpen, setIsCartOpen] = React.useState(false)

    const addToCart = (room, property) => {
        setCart((prev) => {
            // For this demo, we'll allow multiple rooms even from different properties
            // but usually you'd want to restrict to one property at a time.
            const exists = prev.find(item => item.id === room.id)
            if (exists) return prev
            return [...prev, { ...room, propertyName: property.name, propertyId: property.id }]
        })
        setIsCartOpen(true)
    }

    const removeFromCart = (roomId) => {
        setCart((prev) => prev.filter(item => item.id !== roomId))
    }

    const clearCart = () => setCart([])

    const total = cart.reduce((sum, item) => {
        const itemPrice = Number(item.weekday_price || item.price || 0)
        return sum + itemPrice
    }, 0)

    return (
        <BookingContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            clearCart,
            total,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </BookingContext.Provider>
    )
}

export function useBooking() {
    const context = React.useContext(BookingContext)
    if (context === undefined) {
        throw new Error("useBooking must be used within a BookingProvider")
    }
    return context
}
