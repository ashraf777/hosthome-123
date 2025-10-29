
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

import { StepOwner } from "./step-owner"
import { StepPropertyDetails } from "./step-property-details"
import { StepRoomTypes } from "./step-room-types"
import { StepUnits } from "./step-units"
import { StepFinalizeOwner } from "./step-finalize-owner"
import { api } from "@/services/api"

const steps = [
  { id: "company", title: "Hosting Company" },
  { id: "details", title: "Property Details" },
  { id: "rooms", title: "Room Types" },
  { id: "units", title: "Property Units" },
  { id: "owner", title: "Unit Owner" },
]

export function CreateListingWizard() {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [formData, setFormData] = React.useState({
    hostingCompany: null,
    propertyDetails: null,
    propertyId: null,
    roomTypes: [],
    units: {},
    createdUnitIds: [], // To store IDs of units created in step 4
    owner: null,
  })
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleNext = async (data) => {
    let newFormData = { ...formData, ...data }

    if (currentStep === 0) {
      newFormData = { ...newFormData, hostingCompany: data.hostingCompany };
    }
    
    if (currentStep === 1) {
      setIsLoading(true);
      try {
        if (data.propertyDetails.create_new) {
          const payload = {
            ...data.propertyDetails,
            hosting_company_id: newFormData.hostingCompany?.id, 
            listing_status: 'draft',
            status: 0, // Keep status as draft/inactive initially
          };
          // Remove client-side flag and amenities before creating property
          const amenityIds = payload.amenities;
          delete payload.create_new;
          delete payload.amenities; 

          const response = await api.post('properties', payload);
          const newProperty = response.data || response;
          newFormData.propertyId = newProperty.id;
          newFormData.propertyDetails = { ...newProperty, room_types: [] }; // Initialize with server response
          toast({ title: "Property Saved", description: `"${newProperty.name}" has been created.` });

          // Now, attach amenities if any were selected
          if (amenityIds && amenityIds.length > 0) {
              try {
                  await api.post(`properties/${newProperty.id}/amenities`, { amenity_ids: amenityIds });
                  toast({ title: "Amenities Attached", description: `${amenityIds.length} amenities have been linked to the property.` });
              } catch (amenityError) {
                   toast({ variant: "destructive", title: "Amenity Error", description: amenityError.message || "Could not attach amenities." });
              }
          }

        } else {
          newFormData.propertyId = data.propertyDetails.id;
          newFormData.propertyDetails = data.propertyDetails;
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: error.message || "Could not save property details." });
        setIsLoading(false);
        return;
      } finally {
        setIsLoading(false);
      }
    }
    
    // Store created unit IDs from step 4
    if (currentStep === 3) {
      newFormData.createdUnitIds = data.createdUnitIds || [];
    }
    
    setFormData(newFormData);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  // The final submission is now handled inside StepFinalizeOwner
  const handleSubmit = (data) => {
    console.log("This handler is deprecated. Final submission logic is in Step 5.");
  }


  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepOwner
            onNext={handleNext}
            initialData={{ hosting_company: formData.hostingCompany }}
          />
        )
      case 1:
        return (
          <StepPropertyDetails
            onNext={handleNext}
            onBack={handleBack}
            initialData={formData.propertyDetails}
          />
        )
      case 2:
        return (
          <StepRoomTypes
            onNext={handleNext}
            onBack={handleBack}
            initialData={formData.roomTypes}
            propertyId={formData.propertyId}
            propertyDetails={formData.propertyDetails}
            setWizardData={setFormData}
          />
        )
      case 3:
        return (
          <StepUnits
            onNext={handleNext}
            onBack={handleBack}
            roomTypes={formData.roomTypes}
            initialData={formData.units}
            propertyId={formData.propertyId}
          />
        )
      case 4:
        return (
           <StepFinalizeOwner
            onBack={handleBack}
            onFinish={handleSubmit} // This is now handled internally by StepFinalizeOwner
            initialData={formData.owner}
            propertyId={formData.propertyId}
            createdUnitIds={formData.createdUnitIds}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <ol className="flex items-center w-full max-w-3xl">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className={`flex w-full items-center ${
                index < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block" : ""
              } ${
                index <= currentStep ? "after:border-primary" : "after:border-muted"
              }`}
            >
              <span
                className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
                  index <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {isLoading && index === currentStep ? <Loader2 className="animate-spin" /> : index + 1}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <Card>
        <CardContent className="p-6">{renderStep()}</CardContent>
      </Card>
      
    </div>
  )
}
