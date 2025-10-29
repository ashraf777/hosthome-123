
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { GlobalPropertyForm } from "../property-form";


export default function NewPropertyPage() {
  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center gap-4">
        <Link href="/dashboard/properties" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Property</h1>
            <p className="text-muted-foreground">Create a new property in your portfolio.</p>
        </div>
      </div>
      <GlobalPropertyForm isEditMode={false} />
    </div>
  )
}
