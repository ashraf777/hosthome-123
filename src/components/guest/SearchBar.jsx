
"use client"

import * as React from "react"
import { Search, MapPin, Calendar, Users, ChevronDown } from "lucide-react"
import { format } from "date-fns"
import { MALAYSIAN_CITIES } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

export function SearchBar({ onSearch }) {
    const [location, setLocation] = React.useState("")
    const [dateRange, setDateRange] = React.useState({ from: null, to: null })
    const [guests, setGuests] = React.useState(1)

    const handleSearchClick = () => {
        onSearch({ location, ...dateRange, guests })
    }

    return (
        <div className="flex flex-col md:flex-row items-center w-full">
            {/* Location */}
            <div className="flex-1 w-full border-b md:border-b-0 md:border-r px-6 py-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <div className="flex flex-col cursor-pointer">
                            <span className="text-xs font-bold uppercase tracking-wider">Location</span>
                            <span className="text-sm text-muted-foreground truncate">
                                {location || "Where are you going?"}
                            </span>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2" align="start">
                        <div className="grid gap-1">
                            {MALAYSIAN_CITIES.map(city => (
                                <button
                                    key={city}
                                    onClick={() => setLocation(city)}
                                    className="text-left px-3 py-2 rounded-md hover:bg-muted text-sm transition"
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Check-in / Out */}
            <div className="flex-1 w-full border-b md:border-b-0 md:border-r px-6 py-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <div className="flex flex-col cursor-pointer">
                            <span className="text-xs font-bold uppercase tracking-wider">Check in / out</span>
                            <span className="text-sm text-muted-foreground truncate">
                                {dateRange.from ? (
                                    dateRange.to ? `${format(dateRange.from, "LLL dd")} - ${format(dateRange.to, "LLL dd")}` : format(dateRange.from, "LLL dd")
                                ) : (
                                    "Add dates"
                                )}
                            </span>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                        <CalendarComponent
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                            disabled={{ before: new Date() }}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Guests */}
            <div className="flex-1 w-full px-6 py-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <div className="flex flex-col cursor-pointer">
                            <span className="text-xs font-bold uppercase tracking-wider">Guests</span>
                            <span className="text-sm text-muted-foreground truncate">
                                {guests} guest{guests > 1 ? 's' : ''}
                            </span>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-4" align="end">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Guests</span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setGuests(Math.max(1, guests - 1))}
                                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted"
                                >
                                    -
                                </button>
                                <span>{guests}</span>
                                <button
                                    onClick={() => setGuests(guests + 1)}
                                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Search Button */}
            <div className="px-4 py-2">
                <Button onClick={handleSearchClick} className="rounded-full w-full md:w-12 h-12 p-0 flex items-center justify-center">
                    <Search className="h-5 w-5" />
                    <span className="md:hidden ml-2 font-semibold">Search</span>
                </Button>
            </div>
        </div>
    )
}
