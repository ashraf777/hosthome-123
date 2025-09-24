import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Banknote, Download, Link, Settings } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";

export default function PayoutPage() {
  const payouts = [
    { id: "PAY-001", date: "2024-07-16", method: "Bank Transfer", amount: "$1,850.50", status: "Completed" },
    { id: "PAY-002", date: "2024-07-23", method: "Bank Transfer", amount: "$975.00", status: "In Progress" },
    { id: "PAY-003", date: "2024-07-09", method: "Bank Transfer", amount: "$2,300.00", status: "Completed" },
  ];

    const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'In Progress':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="text-primary" />
                Payout History
              </CardTitle>
              <CardDescription className="mt-2">
                View your past and upcoming payouts.
              </CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline">
                    <Link className="mr-2" />
                    Connect Payout Method
                </Button>
                 <Button variant="outline">
                    <Settings className="mr-2" />
                    Payout Settings
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payout ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium">{payout.id}</TableCell>
                  <TableCell>{payout.date}</TableCell>
                  <TableCell>{payout.method}</TableCell>
                   <TableCell>
                    <Badge variant={getStatusBadgeVariant(payout.status) as any}>{payout.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{payout.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
