
"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles } from "lucide-react"
import { AmenitiesList } from "./amenities-list"
import { AmenityReferencesList } from "./amenity-references-list"

export default function AmenitiesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight">Amenities</h1>
      </div>
      <Tabs defaultValue="amenities">
        <TabsList className="mb-4">
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="categories">Amenity Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="amenities">
          <Card>
            <CardHeader>
              <CardTitle>All Amenities</CardTitle>
              <CardDescription>
                Create, view, edit, and delete specific amenities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AmenitiesList />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Amenity Categories</CardTitle>
              <CardDescription>
                Manage the categories that group your amenities (e.g., "Kitchen", "Safety").
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AmenityReferencesList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
