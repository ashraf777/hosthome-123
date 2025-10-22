import { PricingForm } from "./pricing-form"

export default function PricingPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Intelligent Pricing Tool</h1>
      <PricingForm />
    </div>
  )
}
