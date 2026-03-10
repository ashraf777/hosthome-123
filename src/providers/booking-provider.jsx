
"use client"

import * as React from "react"

import { eachDayOfInterval, isFriday, isSaturday } from "date-fns"

const BookingContext = React.createContext(undefined)

export function BookingProvider({ children }) {
    const [cart, setCart] = React.useState([])
    const [isCartOpen, setIsCartOpen] = React.useState(false)
    const [dateRange, setDateRange] = React.useState({ from: null, to: null })

    const addToCart = (room, property, selectedDates) => {
        if (selectedDates && selectedDates.from) {
            setDateRange(selectedDates);
        }

        setCart((prev) => {
            const exists = prev.find(item => item.id === room.id)
            if (exists) return prev
            return [...prev, { ...room, propertyName: property.name, propertyId: property.id }]
        })
        setIsCartOpen(true)
    }

    const removeFromCart = (roomId) => {
        setCart((prev) => prev.filter(item => item.id !== roomId))
    }

    const clearCart = () => {
        setCart([])
        setDateRange({ from: null, to: null })
    }

    // Calculate nights based on dateRange
    const { total, nights, weekendNights, weekdayNights } = React.useMemo(() => {
        let nts = 1; // Default to 1 night if no dates selected
        let wknd = 0;
        let wkdy = 1;

        if (dateRange && dateRange.from && dateRange.to && dateRange.from < dateRange.to) {
            // Get all days in interval EXCEPT the checkout day (you don't pay for checkout day)
            const dRange = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
            // Remove the last day (checkout day)
            dRange.pop();

            nts = dRange.length;
            wknd = 0;
            wkdy = 0;

            dRange.forEach(date => {
                // In Malaysia, weekend is typically Friday and Saturday for hotels
                if (isFriday(date) || isSaturday(date)) {
                    wknd++;
                } else {
                    wkdy++;
                }
            });
        }

        const sum = cart.reduce((acc, item) => {
            const wPrice = Number(item.weekday_price || item.price || 0)
            const wePrice = Number(item.weekend_price || wPrice)

            // If no dates, just show 1 night weekday price
            if (!dateRange || !dateRange.from || !dateRange.to) {
                return acc + wPrice;
            }

            return acc + (wPrice * wkdy) + (wePrice * wknd);
        }, 0)

        return { total: sum, nights: nts, weekendNights: wknd, weekdayNights: wkdy }
    }, [cart, dateRange])

    return (
        <BookingContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            clearCart,
            total,
            nights,
            weekendNights,
            weekdayNights,
            dateRange,
            setDateRange,
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
