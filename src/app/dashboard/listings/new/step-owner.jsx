
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
import { CreateHostingCompanyDialog } from "./create-hosting-company-dialog.jsx"

const formSchema = z.object({
  hosting_company_id: z.coerce.number({ required_error: "Please select a hosting company." }),
})

export function StepOwner({ onNext, initialData }) {
  const [hostingCompanies, setHostingCompanies] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [isCreateCompanyOpen, setCreateCompanyOpen] = React.useState(false)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hosting_company_id: initialData?.hosting_company?.id || undefined,
    },
  })

  const fetchHostingCompanies = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('hosting-companies');
      setHostingCompanies(response.data);
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Could not fetch hosting companies." });
    } finally {
        setLoading(false);
    }
  }, [toast]);
  

  React.useEffect(() => {
    fetchHostingCompanies();
  }, [fetchHostingCompanies])
  
  React.useEffect(() => {
      if (initialData) {
          form.setValue("hosting_company_id", initialData.hosting_company?.id)
      }
  }, [initialData, form])

  const handleNewCompanySuccess = (newCompany) => {
    const company = newCompany.data || newCompany;
    setHostingCompanies(prev => [...prev, company])
    form.setValue("hosting_company_id", company.id, { shouldValidate: true })
  }

  const onSubmit = (data) => {
    const selectedCompany = data.hosting_company_id ? hostingCompanies.find(c => c.id === data.hosting_company_id) : null
    onNext({ hostingCompany: selectedCompany });
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardHeader className="p-0 mb-6">
            <CardTitle>Step 1: Hosting Company</CardTitle>
            <CardDescription>Select the hosting company for this listing.</CardDescription>
          </CardHeader>
          
           {loading ? (
             <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
             </div>
           ) : (
            <FormField
              control={form.control}
              name="hosting_company_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hosting Company</FormLabel>
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hostingCompanies.map(company => (
                          <SelectItem key={company.id} value={company.id.toString()}>{company.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* <Button type="button" variant="outline" onClick={() => setCreateCompanyOpen(true)} disabled>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      New Company
                    </Button> */}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
           )}

          <div className="flex justify-end">
            <Button type="submit">Next</Button>
          </div>
        </form>
      </Form>

      <CreateHostingCompanyDialog
        isOpen={isCreateCompanyOpen}
        onClose={() => setCreateCompanyOpen(false)}
        onSuccess={handleNewCompanySuccess}
      />
    </>
  )
}
