"use client"

import * as React from "react"
import { SearchBar } from "./SearchBar"
import { PropertyGrid } from "./PropertyGrid"

export function GuestHomePage({ slug }) {
    const [searchParams, setSearchParams] = React.useState({
        location: "",
        checkIn: null,
        checkOut: null,
        guests: 1,
    });

    const handleSearch = (params) => {
        setSearchParams(prev => ({ ...prev, ...params }));
    };

    return (
        <div className="flex flex-col">
            {/* Hero Section with Search Bar */}
            <div className="relative py-12 bg-muted/20">
                <div className="container mx-auto px-4 flex flex-col items-center">
                    <div className="w-full max-w-4xl bg-background rounded-full shadow-lg border p-2 mb-8">
                        <SearchBar onSearch={handleSearch} slug={slug} />
                    </div>
                </div>
            </div>

            {/* Main Content: Property List */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col gap-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Explore Properties</h2>
                        <p className="text-muted-foreground">Find the perfect place to stay in Malaysia.</p>
                    </div>

                    <PropertyGrid searchParams={searchParams} slug={slug} />
                </div>
            </div>
        </div>
    )
}
