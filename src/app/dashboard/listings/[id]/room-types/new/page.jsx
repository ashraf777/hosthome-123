
import Link from "next/link";
import { RoomTypeForm } from "../room-type-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewRoomTypePage({ params }) {
  const propertyId = params.id;
  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center gap-4">
        <Link href={`/dashboard/listings/${propertyId}/room-types`} passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Room Type</h1>
            <p className="text-muted-foreground">Add a new room type to this property.</p>
        </div>
      </div>
      <RoomTypeForm propertyId={propertyId} />
    </div>
  )
}
