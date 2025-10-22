"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Sparkles, Wand2 } from "lucide-react"

import {
  suggestCompetitivePricing,
} from "@/ai/flows/suggest-competitive-pricing"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"

const formSchema = z.object({
  propertyDescription: z.string().min(10, "Please provide a more detailed description."),
  country: z.string().min(2, "Country is required."),
  city: z.string().min(2, "City is required."),
  neighborhood: z.string().min(2, "Neighborhood is required."),
  propertyType: z.string({ required_error: "Please select a property type." }),
  numberOfBedrooms: z.coerce.number().min(1, "Must have at least one bedroom."),
  numberOfBathrooms: z.coerce.number().min(1, "Must have at least one bathroom."),
  amenities: z.string().min(5, "List at least one amenity."),
  season: z.string({ required_error: "Please select a season." }),
  localEvents: z.string().optional(),
  occupancyRate: z.coerce.number().min(0).max(100),
  competitorPrices: z.string().optional(),
  bookingWindow: z.string({ required_error: "Please select a booking window." }),
  currentPrice: z.coerce.number().min(0),
})

export function PricingForm() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyDescription: "A cozy 2-bedroom apartment in the city center, perfect for tourists and business travelers.",
      country: "USA",
      city: "Metropolis",
      neighborhood: "Downtown",
      propertyType: "Apartment",
      numberOfBedrooms: 2,
      numberOfBathrooms: 1,
      amenities: "Wi-Fi, Air Conditioning, Kitchen, Free Parking",
      season: "Summer",
      localEvents: "Metropolis Comic Con",
      occupancyRate: 75,
      competitorPrices: "140, 160, 155",
      bookingWindow: "1-3 months in advance",
      currentPrice: 150,
    },
  })

  async function onSubmit(values) {
    setLoading(true)
    setResult(null)
    try {
      const suggestion = await suggestCompetitivePricing(values)
      setResult(suggestion)
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Failed to get pricing suggestion. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Analyze Your Property</CardTitle>
              <CardDescription>
                Fill in the details below and let our AI suggest the optimal price.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="propertyDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your property..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                 <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., USA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Neighborhood</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., SoHo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Apartment">Apartment</SelectItem>
                          <SelectItem value="House">House</SelectItem>
                          <SelectItem value="Villa">Villa</SelectItem>
                          <SelectItem value="Condo">Condo</SelectItem>
                           <SelectItem value="Townhouse">Townhouse</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numberOfBedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numberOfBathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <FormField
                control={form.control}
                name="amenities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amenities</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Wi-Fi, Pool, Gym" {...field} />
                    </FormControl>
                    <FormDescription>Separate amenities with a comma.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="season"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Season</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a season" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Spring">Spring</SelectItem>
                          <SelectItem value="Summer">Summer</SelectItem>
                          <SelectItem value="Autumn">Autumn</SelectItem>
                          <SelectItem value="Winter">Winter</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="localEvents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local Events (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Music Festival" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 <FormField
                  control={form.control}
                  name="occupancyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupancy Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 75" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 150" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 <FormField
                  control={form.control}
                  name="competitorPrices"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Competitor Prices ($)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 140, 160, 155" {...field} />
                      </FormControl>
                       <FormDescription>Separate prices with a comma.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bookingWindow"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Booking Window</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select booking window" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Last minute">Last minute</SelectItem>
                          <SelectItem value="1-3 months in advance">1-3 months in advance</SelectItem>
                           <SelectItem value="3+ months in advance">3+ months in advance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Suggest Price
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <div className="lg:col-span-2">
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" />
              AI Suggestion
            </CardTitle>
            <CardDescription>
              Our AI's competitive pricing recommendation will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {loading ? (
              <div className="flex h-full min-h-[300px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Suggested Nightly Rate</p>
                  <p className="text-5xl font-bold text-primary">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(result.suggestedPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Reasoning</p>
                  <p className="text-muted-foreground">{result.reasoning}</p>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-6 text-center">
                <p className="text-muted-foreground">Your price suggestion awaits.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
