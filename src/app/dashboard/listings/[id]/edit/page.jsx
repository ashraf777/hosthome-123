
"use client"

import * as React from "react"
import Link from "next/link"
import { api } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UnitEditTab } from "./unit-edit-tab"
import { RoomTypeEditTab } from "./room-type-edit-tab"
import { PropertyEditTab } from "./property-edit-tab"

export default function EditListingPage({ params }) {
  const { id: unitId } = params;
  const [loading, setLoading] = React.useState(true)
  const [unitData, setUnitData] = React.useState(null)
  const [activeTab, setActiveTab] = React.useState("unit")
  const { toast } = useToast()

  const fetchData = React.useCallback(async () => {
    // We don't set loading to true here to avoid flashing on re-fetch
    try {
      const unitRes = await api.get(`units/${unitId}`)
      setUnitData(unitRes.data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not fetch listing details. ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }, [unitId, toast])

  React.useEffect(() => {
    setLoading(true);
    fetchData()
  }, [fetchData])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/listings" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <div>
          {loading ? (
            <>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold tracking-tight">Edit Listing Wizard</h1>
              
            </>
          )}
        </div>
      </div>

       {loading ? (
          <div className="space-y-4">
              <Skeleton className="h-10 w-96" />
              <Skeleton className="h-96 w-full" />
          </div>
       ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
                <TabsTrigger value="unit">Unit</TabsTrigger>
                <TabsTrigger value="roomType">Room Type</TabsTrigger>
                <TabsTrigger value="property">Property</TabsTrigger>
            </TabsList>
            <TabsContent value="unit">
                <UnitEditTab unitData={unitData} onUpdate={fetchData} />
            </TabsContent>
            <TabsContent value="roomType">
                <RoomTypeEditTab 
                    roomTypeId={unitData?.room_type?.id} 
                    propertyId={unitData?.property?.id} 
                    onUpdate={fetchData} 
                />
            </TabsContent>
            <TabsContent value="property">
                <PropertyEditTab 
                    propertyId={unitData?.property?.id} 
                    onUpdate={fetchData} 
                />
            </TabsContent>
        </Tabs>
       )}
    </div>
  )
}
