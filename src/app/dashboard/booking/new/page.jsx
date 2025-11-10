
"use client"
import { BookingForm } from "../booking-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";


export default function NewBookingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
         <Link href="/dashboard/booking" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Reservation</h1>
          <p className="text-muted-foreground">Add a new reservation to your calendar.</p>
        </div>
      </div>
      <BookingForm isEditMode={false} />
    </div>
  )
}
