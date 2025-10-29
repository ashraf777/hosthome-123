
"use client"

import { ListingList } from "../listings/listing-list"


export default function PropertiesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">All Properties</h1>
      <p className="text-muted-foreground">An overview of all properties in your portfolio.</p>
      <ListingList />
    </div>
  )
}
