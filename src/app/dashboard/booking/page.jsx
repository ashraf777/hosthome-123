import { BookingList } from "./booking-list";

export default function BookingPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Reservation Management</h1>
      <BookingList />
    </div>
  )
}
