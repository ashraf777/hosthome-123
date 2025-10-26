
import Link from "next/link";
import { RoomTypeForm } from "@/app/dashboard/listings/[id]/room-types/room-type-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditRoomTypePage({ params }) {
  const { id: propertyId, roomTypeId } = params;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/room-types/${roomTypeId}`} passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Room Type</h1>
          <p className="text-muted-foreground">Editing room type ID: {roomTypeId}</p>
        </div>
      </div>
      <RoomTypeForm isEditMode propertyId={propertyId} roomTypeId={roomTypeId} />
    </div>
  )
}
