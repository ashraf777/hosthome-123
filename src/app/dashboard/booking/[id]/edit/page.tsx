import Link from "next/link";
import { BookingForm } from "../../booking-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditBookingPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/booking" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Booking</h1>
          <p className="text-muted-foreground">Editing booking with ID: {params.id}</p>
        </div>
      </div>
      {/* 
        In a real application, you would fetch the booking data using the id
        and pass it as a prop to the BookingForm.
        e.g. <BookingForm initialData={bookingData} isEditMode />
      */}
      <BookingForm isEditMode />
    </div>
  )
}
