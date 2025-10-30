
import Link from "next/link";
import { GlobalRoomTypeForm } from "../../global-room-type-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditGlobalRoomTypePage({ params }) {
  const { roomTypeId } = params;

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
      <GlobalRoomTypeForm isEditMode roomTypeId={roomTypeId} />
    </div>
  )
}
