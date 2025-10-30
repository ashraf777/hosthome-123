
"use client"

import * as React from "react"
import { ListingList } from "./listing-list"

export default function AllListingsPage() {
  
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Listings</h1>
       <ListingList />
    </div>
  )
}
