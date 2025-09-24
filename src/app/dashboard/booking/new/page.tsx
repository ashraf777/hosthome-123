import { BookingForm } from "../booking-form";

export default function NewBookingPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Create New Booking</h1>
      <BookingForm isEditMode={false} />
    </div>
  )
}
