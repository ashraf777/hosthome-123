
import Link from "next/link";
import { CreateListingWizard } from "./create-listing-wizard";
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
            <p className="text-muted-foreground">Follow the steps to add a new property to your portfolio.</p>
        </div>
      </div>
      <CreateListingWizard />
    </div>
  )
}
