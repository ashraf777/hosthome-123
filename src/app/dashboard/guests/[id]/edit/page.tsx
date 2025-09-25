import Link from "next/link";
import { GuestForm } from "../../guest-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditGuestPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/guests" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Guest</h1>
          <p className="text-muted-foreground">Editing guest with ID: {params.id}</p>
        </div>
      </div>
      <GuestForm isEditMode guestId={params.id} />
    </div>
  )
}
