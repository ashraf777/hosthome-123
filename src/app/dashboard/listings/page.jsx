import { ListingList } from "./listing-list";

export default function ListingPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Property Listings</h1>
      <ListingList />
    </div>
  )
}
