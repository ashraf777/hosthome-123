import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus, Download, SlidersHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";

export default function ExpensesPage() {
  const expenses = [
    { id: "EXP-001", date: "2024-07-10", category: "Maintenance", amount: "$120.00", property: "Cozy Downtown Apartment" },
    { id: "EXP-002", date: "2024-07-12", category: "Utilities", amount: "$85.50", property: "Beachside Villa" },
    { id: "EXP-003", date: "2024-07-15", category: "Supplies", amount: "$45.00", property: "Cozy Downtown Apartment" },
    { id: "EXP-004", date: "2024-07-20", category: "Cleaning", amount: "$75.00", property: "Mountain Cabin Retreat" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="text-primary" />
                Manage Expenses
              </CardTitle>
              <CardDescription className="mt-2">
                Track all your property-related expenses.
              </CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline">
                    <SlidersHorizontal className="mr-2" />
                    Filter
                </Button>
                <Button>
                    <Plus className="mr-2" />
                    Add Expense
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expense ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Property</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.id}</TableCell>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{expense.category}</Badge>
                  </TableCell>
                  <TableCell>{expense.property}</TableCell>
                  <TableCell className="text-right font-medium">{expense.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
