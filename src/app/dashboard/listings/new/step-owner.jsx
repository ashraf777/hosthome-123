
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { CreatePropertyOwnerDialog } from "../create-property-owner-dialog.jsx"
import { CreateHostingCompanyDialog } from "./create-hosting-company-dialog.jsx"

const formSchema = z.object({
  hosting_company: z.any().optional(),
  owner: z.any().optional(),
})

export function StepOwner({ onNext, onBack, initialData }) {
  const [hostingCompanies, setHostingCompanies] = React.useState([])
  const [owners, setOwners] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [isCreateCompanyOpen, setCreateCompanyOpen] = React.useState(false)
  const [isCreateOwnerOpen, setCreateOwnerOpen] = React.useState(false)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hosting_company: initialData?.hosting_company || undefined,
      owner: initialData?.owner || undefined,
    },
  })

  // Mock fetching hosting companies
  React.useEffect(() => {
    setHostingCompanies([
        {id: 1, name: "Default Hosting Co."},
        {id: 2, name: "Vacation Rentals Inc."}
    ]);
  }, []);

  const fetchOwners = React.useCallback(async () => {
    setLoading(true)
    try {
      const ownersRes = await api.get('property-owners')
      setOwners(ownersRes.data)
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch property owners." })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    fetchOwners()
  }, [fetchOwners])
  
  React.useEffect(() => {
      if (initialData) {
          form.setValue("hosting_company", initialData.hosting_company?.id)
          form.setValue("owner", initialData.owner?.id)
      }
  }, [initialData, form])

  const handleNewCompanySuccess = (newCompany) => {
    setHostingCompanies(prev => [...prev, newCompany])
    form.setValue("hosting_company", newCompany.id, { shouldValidate: true })
  }

  const handleNewOwnerSuccess = (newOwner) => {
    setOwners(prev => [...prev, newOwner])
    form.setValue("owner", newOwner.id, { shouldValidate: true })
  }

  const onSubmit = (data) => {
    const selectedCompany = data.hosting_company ? hostingCompanies.find(c => c.id === data.hosting_company) : null
    const selectedOwner = data.owner ? owners.find(o => o.id === data.owner) : null
    onNext({ hosting_company: selectedCompany, owner: selectedOwner })
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardHeader className="p-0 mb-6">
            <CardTitle>Step 2: Ownership</CardTitle>
            <CardDescription>Select the hosting company and owner. Both are optional for now.</CardDescription>
          </CardHeader>
          
           <FormField
              control={form.control}
              name="hosting_company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hosting Company</FormLabel>
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a company (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hostingCompanies.map(company => (
                          <SelectItem key={company.id} value={company.id.toString()}>{company.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" onClick={() => setCreateCompanyOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      New Company
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <FormField
              control={form.control}
              name="owner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Owner</FormLabel>
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an owner (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {owners.map(owner => (
                          <SelectItem key={owner.id} value={owner.id.toString()}>{owner.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" onClick={() => setCreateOwnerOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      New Owner
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>Back</Button>
            <Button type="submit">Next</Button>
          </div>
        </form>
      </Form>

      <CreateHostingCompanyDialog
        isOpen={isCreateCompanyOpen}
        onClose={() => setCreateCompanyOpen(false)}
        onSuccess={handleNewCompanySuccess}
      />
      
      <CreatePropertyOwnerDialog
        isOpen={isCreateOwnerOpen}
        onClose={() => setCreateOwnerOpen(false)}
        onSuccess={handleNewOwnerSuccess}
      />
    </>
  )
}
