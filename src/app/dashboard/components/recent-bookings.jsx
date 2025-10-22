import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const bookings = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    avatar: "https://picsum.photos/seed/om/40/40",
    amount: 1999.00,
    status: "Confirmed",
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    avatar: "https://picsum.photos/seed/jl/40/40",
    amount: 39.00,
    status: "Confirmed",
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    avatar: "https://picsum.photos/seed/in/40/40",
    amount: 299.00,
    status: "Pending",
  },
  {
    name: "William Kim",
    email: "will@email.com",
    avatar: "https://picsum.photos/seed/wk/40/40",
    amount: 99.00,
    status: "Confirmed",
  },
  {
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    avatar: "https://picsum.photos/seed/sd/40/40",
    amount: 39.00,
    status: "Cancelled",
  },
]

export function RecentBookings() {
  const getBadgeVariant = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.email}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={booking.avatar} alt="Avatar" data-ai-hint="person face" />
                  <AvatarFallback>{booking.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="font-medium">{booking.name}</div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={getBadgeVariant(booking.status)}>{booking.status}</Badge>
            </TableCell>
            <TableCell className="text-right">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(booking.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
