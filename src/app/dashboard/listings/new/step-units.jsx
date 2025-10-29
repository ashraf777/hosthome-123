
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

const unitSchema = z.object({
  id: z.string(),
  unit_identifier: z.string().min(1, "Identifier is required."),
  status: z.string().default("available"),
  description: z.string().optional(),
  space: z.string().optional(),
  guest_access: z.string().optional(),
});

const formSchema = z.object({
  units: z.record(z.array(unitSchema)),
});

export function StepUnits({ onNext, onBack, initialData, roomTypes }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      units: initialData || {},
    },
  });

  const { control, handleSubmit } = form;

  const onSubmit = (data) => {
    onNext(data); 
  }

  const hasRoomTypes = roomTypes && roomTypes.length > 0;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <CardHeader className="p-0">
          <CardTitle>Step 4: Create Units</CardTitle>
          <CardDescription>Add and configure individual units for each room type you defined. This is optional.</CardDescription>
        </CardHeader>

        {hasRoomTypes ? (
          <Accordion type="multiple" defaultValue={roomTypes.map(rt => rt.id.toString())} className="w-full space-y-4">
            {roomTypes.map((roomType, roomTypeIndex) => {
              const { fields, append, remove } = useFieldArray({
                control,
                name: `units.${roomType.id}`
              });

              return (
                <AccordionItem value={roomType.id.toString()} key={roomType.id} className="border rounded-lg bg-background">
                  <AccordionTrigger className="p-4 hover:no-underline rounded-t-lg">
                    <div className="flex flex-col text-left">
                      <span className="font-semibold">Room Type: {roomType.name}</span>
                      <span className="text-sm text-muted-foreground">Add units for this room type</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-0 border-t">
                    <div className="space-y-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => append({ id: `new-${Date.now()}`, unit_identifier: "", status: "available" })}
                        >
                            <PlusCircle className="mr-2" />
                            Add Unit to "{roomType.name}"
                        </Button>
                      {fields.map((field, index) => (
                        <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
                          <h4 className="font-medium">Unit {index + 1}</h4>
                          <Separator />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField
                                control={control}
                                name={`units.${roomType.id}.${index}.unit_identifier`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Unit Identifier</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., Room 101, Appt 3B" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name={`units.${roomType.id}.${index}.status`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="owner_use">Owner Use</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                          </div>

                            <FormField
                                control={control}
                                name={`units.${roomType.id}.${index}.description`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                    <Textarea placeholder="Describe the unit..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={control}
                                name={`units.${roomType.id}.${index}.space`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>About Your Place</FormLabel>
                                    <FormControl>
                                    <Textarea placeholder="What makes this unit unique?" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={control}
                                name={`units.${roomType.id}.${index}.guest_access`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Guest Access</FormLabel>
                                    <FormControl>
                                    <Textarea placeholder="What can guests access?" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                          
                           <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">You didn't add any room types in the previous step.</p>
            <p className="text-sm text-muted-foreground">Go back to add room types before defining units.</p>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>Back</Button>
          <Button type="submit">Next</Button>
        </div>
      </form>
    </Form>
  )
}
