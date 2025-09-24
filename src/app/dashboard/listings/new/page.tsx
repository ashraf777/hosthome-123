import Link from "next/link";
import { ListingForm } from "../listing-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewListingPage() {
  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center gap-4">
        <Link href="/dashboard/listings" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Listing</h1>
            <p className="text-muted-foreground">Add a new property to your portfolio.</p>
        </div>
      </div>
      <ListingForm isEditMode={false} />
    </div>
  )
}
