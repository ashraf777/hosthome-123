
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
import { Button } from "@/components/ui/button"
import { Home, PlusCircle } from "lucide-react"
import { PropertyList } from "./property-list"

export default function PropertiesPage() {
  
  return (
    <div className="flex flex-col gap-6">
       <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
              <div>
                  <CardTitle className="flex items-center gap-2">
                    <Home />
                    All Properties
                  </CardTitle>
                  <CardDescription>
                    An overview of all properties in your portfolio.
                  </CardDescription>
              </div>
              <Link href="/dashboard/properties/new">
                <Button>
                    <PlusCircle className="mr-2" />
                    Add Property
                </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <PropertyList />
        </CardContent>
      </Card>
    </div>
  )
}
