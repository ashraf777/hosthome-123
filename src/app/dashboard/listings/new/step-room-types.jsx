
"use client"

import * as React from "react"
import { useFieldArray, useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PlusCircle, Trash2, Upload, Star } from "lucide-react"
import Image from "next/image"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const roomTypeSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  max_guests: z.coerce.number().optional(),
  photos: z.array(z.object({
      id: z.string(),
      file: z.any(),
      preview: z.string(),
      is_main: z.boolean()
  })).optional(),
})

const formSchema = z.object({
  roomTypes: z.record(z.array(roomTypeSchema)),
});


export function StepRoomTypes({ onBack, onFinish, initialData, units }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomTypes: initialData || {},
    },
  })

  const { control, handleSubmit } = form;

  const handleAddRoomType = (unitId) => {
    const currentRoomTypes = form.getValues(`roomTypes.${unitId}`) || [];
    form.setValue(`roomTypes.${unitId}`, [
      ...currentRoomTypes,
      {
        id: `new-${Date.now()}`,
        name: "",
        max_guests: 2,
        photos: [],
      }
    ]);
  };
  
  const handleRemoveRoomType = (unitId, roomIndex) => {
     const currentRoomTypes = form.getValues(`roomTypes.${unitId}`) || [];
     const newRoomTypes = currentRoomTypes.filter((_, index) => index !== roomIndex);
     form.setValue(`roomTypes.${unitId}`, newRoomTypes);
  }

  const handleFileChange = (unitId, roomIndex, event) => {
    const file = event.target.files[0]
    if (!file) return

    const newPhoto = {
        id: `photo-${Date.now()}`,
        file: file,
        preview: URL.createObjectURL(file),
        is_main: (form.getValues(`roomTypes.${unitId}`)[roomIndex].photos?.length || 0) === 0,
    }
    
    const updatedPhotos = [...(form.getValues(`roomTypes.${unitId}`)[roomIndex].photos || []), newPhoto];
    const currentRooms = form.getValues(`roomTypes.${unitId}`);
    currentRooms[roomIndex].photos = updatedPhotos;
    form.setValue(`roomTypes.${unitId}`, currentRooms);
    form.trigger(`roomTypes.${unitId}`); // Trigger re-render
  }

  const handleRemovePhoto = (unitId, roomIndex, photoId) => {
     const currentPhotos = form.getValues(`roomTypes.${unitId}`)[roomIndex].photos;
     let newPhotos = currentPhotos.filter(p => p.id !== photoId);

     if (newPhotos.length > 0 && !newPhotos.some(p => p.is_main)) {
         newPhotos[0].is_main = true;
     }
     
     const currentRooms = form.getValues(`roomTypes.${unitId}`);
     currentRooms[roomIndex].photos = newPhotos;
     form.setValue(`roomTypes.${unitId}`, currentRooms);
     form.trigger(`roomTypes.${unitId}`);
  }


  const onSubmit = (data) => {
    onFinish({ roomTypes: data.roomTypes })
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <CardHeader className="p-0">
          <CardTitle>Step 4: Room Types & Photos</CardTitle>
          <CardDescription>Add room types for each unit you created and upload photos.</CardDescription>
        </CardHeader>
        
        <Accordion type="multiple" defaultValue={units.map(u => u.id)} className="w-full space-y-4">
            {units.map((unit) => (
                <AccordionItem value={unit.id} key={unit.id} className="border rounded-lg bg-muted/30">
                    <AccordionTrigger className="p-4">
                        <span className="font-semibold">Unit: {unit.name}</span>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                       <div className="space-y-4">
                            <Controller
                                control={control}
                                name={`roomTypes.${unit.id}`}
                                render={({ field }) => (
                                    <>
                                        {(field.value || []).map((room, roomIndex) => (
                                            <Card key={room.id} className="bg-background/50">
                                            <CardContent className="p-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <FormField
                                                    control={control}
                                                    name={`roomTypes.${unit.id}.${roomIndex}.name`}
                                                    render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Room Type Name</FormLabel>
                                                        <FormControl><Input placeholder="e.g., Deluxe King Suite" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={control}
                                                    name={`roomTypes.${unit.id}.${roomIndex}.max_guests`}
                                                    render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Max Guests</FormLabel>
                                                        <FormControl><Input type="number" placeholder="e.g., 2" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                    )}
                                                />
                                                <div className="flex items-end">
                                                    <Button type="button" variant="destructive" onClick={() => handleRemoveRoomType(unit.id, roomIndex)}>
                                                        <Trash2 className="mr-2" /> Remove Room
                                                    </Button>
                                                </div>
                                                </div>
                                                <div className="mt-4">
                                                    <FormLabel>Photos</FormLabel>
                                                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                        {room.photos?.map((photo) => (
                                                            <div key={photo.id} className="relative group">
                                                                <Image src={photo.preview} alt="Room photo preview" width={150} height={150} className="rounded-md object-cover aspect-square" />
                                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <Button type="button" variant="destructive" size="icon" onClick={() => handleRemovePhoto(unit.id, roomIndex, photo.id)}>
                                                                        <Trash2 />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <label className="flex flex-col items-center justify-center w-full h-full aspect-square rounded-md border-2 border-dashed cursor-pointer hover:bg-muted">
                                                            <Upload className="h-8 w-8 text-muted-foreground"/>
                                                            <span className="text-xs text-muted-foreground">Upload</span>
                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(unit.id, roomIndex, e)} />
                                                        </label>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            </Card>
                                        ))}
                                    </>
                                )}
                            />
                            <Button type="button" variant="outline" className="w-full" onClick={() => handleAddRoomType(unit.id)}>
                                <PlusCircle className="mr-2" />
                                Add Room Type to {unit.name}
                            </Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
        
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>Back</Button>
          <Button type="submit">Finish & Review</Button>
        </div>
      </form>
    </Form>
  )
}
