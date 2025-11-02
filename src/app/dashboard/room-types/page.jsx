
"use client"

import * as React from "react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { Bed, PlusCircle, MoreHorizontal, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"


export default function AllRoomTypesPage() {
  const [roomTypes, setRoomTypes] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const { toast } = useToast()
  const router = useRouter();


  React.useEffect(() => {
    const fetchRoomTypes = async () => {
      setLoading(true)
      try {
        const response = await api.get("room-types")
        const roomTypesData = response.data || response || [];
        setRoomTypes(Array.isArray(roomTypesData) ? roomTypesData : []);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch room types.",
        })
        setRoomTypes([]);
      } finally {
        setLoading(false)
      }
    }
    fetchRoomTypes()
  }, [toast])


  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bed />
                All Room Types
              </CardTitle>
              <CardDescription>
                An overview of all room types across all your properties.
              </CardDescription>
            </div>
            <Link href="/dashboard/room-types/new" passHref>
              <Button>
                <PlusCircle className="mr-2" />
                Create Room Type
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Type</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead className="text-center">Max Guests</TableHead>
                   <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6"><Skeleton className="h-6 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : roomTypes.map((roomType) => (
                  <TableRow key={roomType.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium pl-6">
                      <Link href={`/dashboard/room-types/${roomType.id}`} className="hover:underline">
                        {roomType.name}
                      </Link>
                    </TableCell>
                    <TableCell>{roomType.property?.name || 'N/A'}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{(roomType.max_adults || 0) + (roomType.max_children || 0)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onSelect={() => router.push(`/dashboard/room-types/${roomType.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Room Type
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!loading && roomTypes.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No room types found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
