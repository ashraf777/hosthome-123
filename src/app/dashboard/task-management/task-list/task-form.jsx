
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus } from "lucide-react";

const taskFormSchema = z.object({
  priority: z.string().min(1, "Priority is required"),
  property: z.string().min(1, "Property is required"),
  roomType: z.string().optional(),
  unitListing: z.string().optional(),
  teamAssign: z.string().min(1, "Team is required"),
  checklist: z.string().min(1, "Checklist is required"),
  numberOfCleaner: z.number().int().min(1, "At least one cleaner is required"),
  notes: z.string().optional(),
});

export function TaskForm({ onSubmit, initialData = {} }) {
  const form = useForm({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      priority: initialData.priority || "",
      property: initialData.property || "",
      roomType: initialData.roomType || "",
      unitListing: initialData.unitListing || "",
      teamAssign: initialData.teamAssign || "",
      checklist: initialData.checklist || "",
      numberOfCleaner: initialData.numberOfCleaner || 1,
      notes: initialData.notes || "",
    },
  });

  const { watch, setValue } = form;
  const numberOfCleaner = watch("numberOfCleaner");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a priority" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="property"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Property</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {/* TODO: Populate with actual properties */}
                        <SelectItem value="property1">Property 1</SelectItem>
                        <SelectItem value="property2">Property 2</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="roomType"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Room Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a room type" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {/* TODO: Populate with actual room types */}
                        <SelectItem value="roomtype1">Room Type 1</SelectItem>
                        <SelectItem value="roomtype2">Room Type 2</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="unitListing"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Unit Listing</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {/* TODO: Populate with actual units */}
                        <SelectItem value="unit1">Unit 1</SelectItem>
                        <SelectItem value="unit2">Unit 2</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="teamAssign"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Team Assign</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a cleaning team" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {/* TODO: Populate with actual teams */}
                        <SelectItem value="team1">Team 1</SelectItem>
                        <SelectItem value="team2">Team 2</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="checklist"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Checklist</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a checklist" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {/* TODO: Populate with actual checklists */}
                        <SelectItem value="checklist1">Checklist 1</SelectItem>
                        <SelectItem value="checklist2">Checklist 2</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="numberOfCleaner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Cleaner</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                        <Button 
                            type="button"
                            variant="outline" 
                            size="icon" 
                            onClick={() => setValue("numberOfCleaner", Math.max(1, numberOfCleaner - 1))}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <Input {...field} className="w-16 text-center" readOnly />
                        <Button 
                            type="button"
                            variant="outline" 
                            size="icon" 
                            onClick={() => setValue("numberOfCleaner", numberOfCleaner + 1)}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Leave a message..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create Task</Button>
      </form>
    </Form>
  );
}
