
"use client"

import * as React from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { KeyRound, PlusCircle } from "lucide-react"
import { api } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function AllUnitsPage() {
  const [units, setUnits] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const { toast } = useToast()

  React.useEffect(() => {
    const fetchUnits = async () => {
      setLoading(true)
      try {
        const response = await api.get("units")
        // Ensure that we have an array to prevent .map errors
        if (Array.isArray(response)) {
            setUnits(response);
        } else if (response && Array.isArray(response.data)) {
            setUnits(response.data);
        } else {
            console.error("API response for units is not an array:", response);
            setUnits([]); // Set to empty array on unexpected format
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch units.",
        })
        setUnits([]); // Set to empty array on error
      } finally {
        setLoading(false)
      }
    }
    fetchUnits()
  }, [toast])

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'maintenance':
        return 'destructive';
      case 'owner_use':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">All Property Units</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <KeyRound />
                All Units
              </CardTitle>
              <CardDescription>
                An overview of all bookable units across all your properties.
              </CardDescription>
            </div>
            <Link href="/dashboard/units/new" passHref>
              <Button>
                <PlusCircle className="mr-2" />
                Create Unit
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit Identifier</TableHead>
                  <TableHead>Room Type</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.unit_identifier}</TableCell>
                    <TableCell>{unit.room_type.name}</TableCell>
                    <TableCell>{unit.room_type.property.name}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(unit.status)} className="capitalize">
                        {unit.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!loading && units.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No units found. Create properties and room types to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
