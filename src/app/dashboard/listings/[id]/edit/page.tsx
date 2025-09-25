import Link from "next/link";
import { ListingForm } from "../../listing-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditListingPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/listings" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Listing</h1>
          <p className="text-muted-foreground">Editing property with ID: {params.id}</p>
        </div>
      </div>
      <ListingForm isEditMode listingId={params.id} />
    </div>
  )
}
