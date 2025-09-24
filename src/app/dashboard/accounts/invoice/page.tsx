import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Plus, Download, Send } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";

export default function InvoicePage() {
  const invoices = [
    { id: "INV-G-001", guest: "Olivia Martin", date: "2024-07-18", amount: "$599.00", status: "Sent" },
    { id: "INV-G-002", guest: "Jackson Lee", date: "2024-07-22", amount: "$250.00", status: "Draft" },
    { id: "INV-G-003", guest: "William Kim", date: "2024-07-12", amount: "$300.00", status: "Paid" },
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'default';
      case 'Sent':
        return 'secondary';
      case 'Draft':
        return 'outline';
      default:
        return 'outline';
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="text-primary" />
                Guest Invoices
              </CardTitle>
              <CardDescription className="mt-2">
                Create and manage invoices for your guests.
              </CardDescription>
            </div>
            <Button>
              <Plus className="mr-2" />
              Create Invoice
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.guest}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(invoice.status) as any}>{invoice.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                     <Button variant="ghost" size="icon" title="Send">
                        <Send className="h-4 w-4" />
                     </Button>
                     <Button variant="ghost" size="icon" title="Download">
                        <Download className="h-4 w-4" />
                     </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
