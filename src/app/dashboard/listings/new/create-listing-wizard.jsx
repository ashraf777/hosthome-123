
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

import { StepPropertyDetails } from "./step-property-details"
import { StepOwner } from "./step-owner"
import { StepUnits } from "./step-units"
import { StepRoomTypes } from "./step-room-types"

const steps = [
  { id: "details", title: "Property Details" },
  { id: "owner", title: "Property Owner" },
  { id: "units", title: "Property Units" },
  { id: "rooms", title: "Room Types & Photos" },
]

export function CreateListingWizard() {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [formData, setFormData] = React.useState({
    propertyDetails: null,
    owner: null,
    units: [],
    roomTypes: {}, // Object to hold room types for each unit
  })
  const [isLoading, setIsLoading] = React.useState(false)
  const [owners, setOwners] = React.useState([])
  const router = useRouter()
  const { toast } = useToast()

  React.useEffect(() => {
    const fetchOwners = async () => {
        try {
            const ownersRes = await api.get('property-owners');
            setOwners(ownersRes.data);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not pre-fetch property owners." });
        }
    };
    fetchOwners();
  }, [toast]);

  const handleNext = (data) => {
    setFormData((prev) => ({ ...prev, ...data }))
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    toast({ title: "Submitting...", description: "This is a placeholder for the final API calls." });
    console.log("Final Form Data:", formData);
    
    // Placeholder for future API logic
    // You will replace this with your actual API calls
    
    // Example logic:
    // 1. Create Property
    // 2. Create Units for the Property
    // 3. Create Room Types for each Unit
    // 4. Upload photos for each Room Type
    
    setTimeout(() => {
        setIsLoading(false);
        toast({
            title: "Wizard Complete (Placeholder)",
            description: "Check the console for the final form data structure.",
        });
        router.push("/dashboard/listings");
    }, 2000);
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepPropertyDetails
            onNext={handleNext}
            initialData={formData.propertyDetails}
          />
        )
      case 1:
        return (
          <StepOwner
            onNext={handleNext}
            onBack={handleBack}
            initialData={formData.owner}
          />
        )
      case 2:
        return (
            <StepUnits
                onNext={handleNext}
                onBack={handleBack}
                initialData={formData.units}
            />
        )
      case 3:
        return (
          <StepRoomTypes
            onBack={handleBack}
            onFinish={handleNext}
            units={formData.units}
            initialData={formData.roomTypes}
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
                {index + 1}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <Card>
        <CardContent className="p-6">{renderStep()}</CardContent>
      </Card>
      
      {currentStep === steps.length - 1 && (
         <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={isLoading} size="lg">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Saving..." : "Save Property"}
            </Button>
         </div>
      )}
    </div>
  )
}
