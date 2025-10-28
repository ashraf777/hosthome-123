
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
import { api } from "@/services/api"

const steps = [
  { id: "owner", title: "Property Owner" },
  { id: "details", title: "Property Details" },
  { id: "rooms", title: "Room Types" },
  { id: "units", title: "Property Units" },
]

export function CreateListingWizard() {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [formData, setFormData] = React.useState({
    owner: null,
    propertyDetails: null,
    propertyId: null, // To hold the ID of the created/selected property
    roomTypes: [],
    units: {},
  })
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleNext = async (data) => {
    let newFormData = { ...formData, ...data };

    // In Step 2, "save" the property and get an ID for the next steps
    if (currentStep === 1) {
        setIsLoading(true);
        try {
            if (data.propertyDetails.create_new) {
                const payload = {
                    ...data.propertyDetails,
                    property_owner_id: newFormData.owner.owner?.id, 
                    listing_status: 'draft',
                };
                
                // Using a mock ID as requested for now
                const mockNewPropertyId = Date.now();
                newFormData.propertyId = mockNewPropertyId;
                
                console.log("Simulating property creation with payload:", payload);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
                toast({ title: "Property Saved (Mock)", description: `Generated mock ID: ${mockNewPropertyId}`});

            } else {
                newFormData.propertyId = data.propertyDetails.property_id;
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not save property details." });
            setIsLoading(false);
            return; // Stop advancement if there's an error
        } finally {
            setIsLoading(false);
        }
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
  
  const handleSubmit = async (data) => {
    const finalData = {...formData, ...data};
    setIsLoading(true)
    
    console.log("Final Form Data for API:", finalData)
    toast({ title: "Submitting final data...", description: "Check console for payload." });

    // Simulate final API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false)
    toast({
        title: "Wizard Complete!",
        description: "Property, room types, and units have been created (simulated).",
    });
    router.push("/dashboard/listings");
  }


  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepOwner
            onNext={handleNext}
            initialData={formData.owner}
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
            />
        )
      case 3:
        return (
          <StepUnits
            onBack={handleBack}
            onFinish={handleSubmit}
            roomTypes={formData.roomTypes}
            initialData={formData.units}
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
