
import Link from "next/link";
import { GlobalPropertyForm } from "../../../properties/property-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditPropertyPage({ params }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/properties" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Property</h1>
          <p className="text-muted-foreground">Editing property with ID: {params.id}</p>
        </div>
      </div>
      <GlobalPropertyForm isEditMode propertyId={params.id} />
    </div>
  )
}
