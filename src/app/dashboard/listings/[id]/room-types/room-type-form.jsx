
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"


export function RoomTypeForm({ form, allAmenities }) {

  return (
    <Card className="border-0 shadow-none">
        <CardHeader className="px-0">
        <CardTitle>Room Type Details</CardTitle>
        <CardDescription>
            Manage the details for this room type.
        </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Room Type Name</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Deluxe King Suite" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem className="flex flex-col pt-7">
                <div className="flex items-center space-x-2">
                    <Switch id="status-switch" checked={field.value} onCheckedChange={field.onChange} />
                    <FormLabel htmlFor="status-switch">Active</FormLabel>
                </div>
                <FormMessage />
            </FormItem>
            )} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="max_adults" render={({ field }) => (
            <FormItem>
                <FormLabel>Max Adults</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
            )} />
            <FormField control={form.control} name="max_children" render={({ field }) => (
            <FormItem>
                <FormLabel>Max Children</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
            )} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="size" render={({ field }) => (
            <FormItem>
                <FormLabel>Room Size</FormLabel>
                <FormControl><Input placeholder="e.g., 25 sqm" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
            )} />
            <FormField control={form.control} name="weekday_price" render={({ field }) => (
            <FormItem>
                <FormLabel>Weekday Price ($)</FormLabel>
                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
            )} />
            <FormField control={form.control} name="weekend_price" render={({ field }) => (
            <FormItem>
                <FormLabel>Weekend Price ($)</FormLabel>
                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
            )} />
        </div>

        <FormField
            control={form.control}
            name="amenity_ids"
            render={() => (
            <FormItem>
                <Accordion type="single" collapsible className="w-full bg-background rounded-lg">
                <AccordionItem value="amenities" className="border">
                    <AccordionTrigger className="px-4">
                    <h3 className="text-md font-medium">Amenities</h3>
                    </AccordionTrigger>
                    <AccordionContent className="p-4">
                    <FormMessage className="mb-4" />
                    <div className="space-y-6">
                        {Object.entries(allAmenities).map(([category, items]) => (
                        <div key={category}>
                            <h4 className="font-medium text-md mb-2">{category}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {items.map((item) => (
                                <FormField
                                key={item.id}
                                control={form.control}
                                name="amenity_ids"
                                render={({ field }) => {
                                    return (
                                    <FormItem
                                        key={item.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                        <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(item.id)}
                                            onCheckedChange={(checked) => {
                                            return checked
                                                ? field.onChange([...(field.value || []), item.id])
                                                : field.onChange(
                                                field.value?.filter(
                                                    (value) => value !== item.id
                                                )
                                                )
                                            }}
                                        />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        {item.name}
                                        </FormLabel>
                                    </FormItem>
                                    )
                                }}
                                />
                            ))}
                            </div>
                        </div>
                        ))}
                    </div>
                    </AccordionContent>
                </AccordionItem>
                </Accordion>
            </FormItem>
            )}
        />
        </CardContent>
    </Card>
  )
}
