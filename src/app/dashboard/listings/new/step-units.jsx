
"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PlusCircle, Trash2 } from "lucide-react"

const formSchema = z.object({
  units: z.array(z.object({
      id: z.string(),
      name: z.string().optional(),
  })).optional(),
});


export function StepUnits({ onNext, onBack, initialData }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      units: initialData && initialData.length > 0 ? initialData : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "units",
  });

  const handleAddUnit = () => {
    append({ id: `new-${Date.now()}`, name: "" });
  };

  const onSubmit = (data) => {
    onNext({ units: data.units });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CardHeader className="p-0 mb-6">
          <div className="flex justify-between items-center">
            <div>
                <CardTitle>Step 3: Property Units</CardTitle>
                <CardDescription>Add the individual units for this property. This step is optional.</CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={handleAddUnit}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Unit
            </Button>
          </div>
        </CardHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2">
                    <FormField
                        control={form.control}
                        name={`units.${index}.name`}
                        render={({ field }) => (
                        <FormItem className="flex-grow">
                            <FormLabel>Unit Name / Identifier</FormLabel>
                            <FormControl>
                                <Input placeholder={`e.g., Unit ${index + 1}, Apartment A`} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => remove(index)}
                     >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove Unit</span>
                    </Button>
                </div>
            ))}
             {fields.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No units added yet. Add one to get started or skip this step.</p>
            )}
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>Back</Button>
          <Button type="submit">Next</Button>
        </div>
      </form>
    </Form>
  )
}
