
import Link from "next/link";
import { GlobalUnitForm } from "../../global-unit-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditUnitPage({ params }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/units" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Unit</h1>
          <p className="text-muted-foreground">Editing unit ID: {params.id}</p>
        </div>
      </div>
      <GlobalUnitForm isEditMode unitId={params.id} />
    </div>
  )
}
