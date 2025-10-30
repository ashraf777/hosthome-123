
"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { GlobalPropertyForm } from "@/app/dashboard/properties/property-form";

export function PropertyEditTab({ propertyId, onUpdate }) {
    if (!propertyId) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">This unit is not associated with a property.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <GlobalPropertyForm
            isEditMode
            propertyId={propertyId}
            onSuccess={onUpdate}
        />
    )
}
