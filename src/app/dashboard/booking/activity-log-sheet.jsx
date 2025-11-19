
"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export function ActivityLogSheet({ isOpen, onClose, payments }) {

  const getStatusBadge = (status) => {
    // As per new requirement: 0 for 'Created', 1 for 'Updated'
    switch (status) {
      case 0:
        return <Badge variant="secondary">Created</Badge>
      case 1:
        return <Badge variant="default">Updated</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Payment Activity Log</SheetTitle>
          <SheetDescription>
            A chronological record of all payment activities for this reservation.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-4">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments && payments.length > 0 ? (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="text-xs pl-4">
                        {format(new Date(payment.created_at), "yyyy-MM-dd, h:mm a")}
                      </TableCell>
                      <TableCell>{payment.payment_method}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-right font-medium pr-4">
                        ${Number(payment.amount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="4" className="h-24 text-center">
                      No payment activities recorded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
