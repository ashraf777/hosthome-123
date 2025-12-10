"use client";

import { useEffect, useState, useRef } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { api } from '@/services/api';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const statusOptions = ['To Do', 'In Progress', 'Paused', 'Completed', 'Cancelled'];
const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];

const taskFormSchema = z.object({
    task_name: z.string().min(1, "Task name is required"),
    property_id: z.string().nullable(),
    room_type_id: z.string().nullable(),
    unit_id: z.string().nullable(),
    preset_task_id: z.string().nullable(),
    status: z.string().min(1, "Status is required"),
    priority: z.string().min(1, "Priority is required"),
    due_date: z.date().nullable(),
    cleaning_team_id: z.string().nullable(),
    checklist_id: z.string().nullable(),
    num_of_cleaners: z.preprocess((val) => (val === "" || val === null) ? null : parseInt(String(val), 10), z.number().nullable()),
    host_notes: z.string().nullable(),
    remarks: z.string().nullable(),
});

export function TaskForm({ onSubmit, task }) {
    const { toast } = useToast();
    const [properties, setProperties] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [units, setUnits] = useState([]);
    const [cleaningTeams, setCleaningTeams] = useState([]);
    const [checklists, setChecklists] = useState([]);
    const [presetTasks, setPresetTasks] = useState([]);
    
    const [isReady, setIsReady] = useState(false); // 👈 State to guard rendering
    const initialTaskRef = useRef(null); // Ref for initial data comparison

    const form = useForm({
        resolver: zodResolver(taskFormSchema),
        defaultValues: {
            task_name: '',
            property_id: null,
            room_type_id: null,
            unit_id: null,
            preset_task_id: null,
            status: 'To Do',
            priority: 'Medium',
            due_date: null,
            cleaning_team_id: null,
            checklist_id: null,
            num_of_cleaners: null,
            host_notes: '',
            remarks: '',
        },
    });

    const propertyId = form.watch('property_id');
    const roomTypeId = form.watch('room_type_id');
    const presetTaskId = form.watch('preset_task_id');

    // --- 1. Initial Setup and Data Fetching (SYNC CORE) ---
    useEffect(() => {
        setIsReady(false); // Start by hiding the form

        const setupForm = async () => {
            try {
                // Fetch base data concurrently
                const [propRes, teamRes, checkRes, presetRes] = await Promise.all([
                    api.get('properties'),
                    api.get('cleaning-teams'),
                    api.get('checklists'),
                    api.get('preset-tasks')
                ]);
                
                // Update all base state
                setProperties(propRes.data || []);
                setCleaningTeams(teamRes.data || []);
                setChecklists(checkRes.data || []);
                setPresetTasks(presetRes.data || []);

                let resetValues = form.defaultValues;
                let initialRoomTypes = [];
                let initialUnits = [];

                if (task) { // Edit Mode
                    initialTaskRef.current = task; 

                    // Fetch conditional data (Room Types/Units) based on the task data
                    if (task.property_id) {
                         initialRoomTypes = (await api.get(`properties/${task.property_id}/room-types`)).data || [];
                    }
                    if (task.room_type_id) {
                         initialUnits = (await api.get(`units?room_type_id=${task.room_type_id}`)).data || [];
                    }
                    
                    // Prepare preset task values for reset
                    resetValues = {
                        ...task,
                        due_date: task.due_date ? new Date(task.due_date) : null,
                        property_id: task.property_id?.toString() || null,
                        room_type_id: task.room_type_id?.toString() || null,
                        unit_id: task.unit_id?.toString() || null,
                        preset_task_id: task.preset_task_id?.toString() || null,
                        cleaning_team_id: task.cleaning_team_id?.toString() || null,
                        checklist_id: task.checklist_id?.toString() || null,
                    };
                } else {
                    initialTaskRef.current = null;
                }

                // GUARANTEE that cascading states are updated BEFORE form.reset()
                setRoomTypes(initialRoomTypes);
                setUnits(initialUnits);
                
                // Reset the form (synchronous)
                form.reset(resetValues);

                // Mark the form as ready to render
                setIsReady(true);
                
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to load initial data." });
            }
        };

        setupForm();
        
    // Cleanup on unmount/close
    return () => {
        initialTaskRef.current = null;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [task]); 

    // --- 2. Property ID Watcher (Cascading Logic) ---
    useEffect(() => {
        if (!isReady) return; // Wait until form is ready

        // Check if propertyId has changed from its initial value
        const isInitialProperty = initialTaskRef.current?.property_id?.toString() === propertyId;

        if (propertyId) {
            api.get(`properties/${propertyId}/room-types`).then(res => {
                setRoomTypes(res.data || []);
                
                // ONLY clear if the property selection is NOT the initial value
                if (!isInitialProperty) { 
                    form.setValue('room_type_id', null);
                    form.setValue('unit_id', null);
                }
            });
        } else {
            setRoomTypes([]);
            setUnits([]);
            form.setValue('room_type_id', null);
            form.setValue('unit_id', null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propertyId, isReady]);

    // --- 3. Room Type ID Watcher (Cascading Logic) ---
    useEffect(() => {
        if (!isReady) return; // Wait until form is ready

        // Check if roomTypeId has changed from its initial value
        const isInitialRoomType = initialTaskRef.current?.room_type_id?.toString() === roomTypeId;

        if (roomTypeId) {
            api.get(`units?room_type_id=${roomTypeId}`).then(res => {
                setUnits(res.data || []);
                
                // ONLY clear if the room type selection is NOT the initial value
                if (!isInitialRoomType) {
                    form.setValue('unit_id', null);
                }
            });
        } else {
            setUnits([]);
            form.setValue('unit_id', null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomTypeId, isReady]);

    // --- 4. Preset Task Watcher (Unchanged) ---
    useEffect(() => {
        if(presetTaskId){
            const selectedPreset = presetTasks.find(p => p.id.toString() === presetTaskId);
            if(selectedPreset){
                form.setValue('task_name', selectedPreset.preset_task_name);
                form.setValue('cleaning_team_id', selectedPreset.cleaning_team_id?.toString() || null);
                form.setValue('checklist_id', selectedPreset.checklist_id?.toString() || null);
                form.setValue('num_of_cleaners', selectedPreset.num_of_cleaners || null);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [presetTaskId, presetTasks]);

    // --- 5. Form Submission (Unchanged) ---
    const handleFormSubmit = async (values) => {
        try {
            const dataToSubmit = {
                ...values,
                due_date: values.due_date ? format(values.due_date, 'yyyy-MM-dd') : null,
                property_id: values.property_id ? parseInt(values.property_id) : null,
                room_type_id: values.room_type_id ? parseInt(values.room_type_id) : null,
                unit_id: values.unit_id ? parseInt(values.unit_id) : null,
                preset_task_id: values.preset_task_id ? parseInt(values.preset_task_id) : null,
                cleaning_team_id: values.cleaning_team_id ? parseInt(values.cleaning_team_id) : null,
                checklist_id: values.checklist_id ? parseInt(values.checklist_id) : null,
            };

            if (task) {
                await api.put(`tasks/${task.id}`, dataToSubmit);
                toast({ title: "Success", description: "Task updated successfully." });
            } else {
                await api.post('tasks', dataToSubmit);
                toast({ title: "Success", description: "Task created successfully." });
            }
            onSubmit(dataToSubmit);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || error.message });
        }
    };

    // --- 6. Component Render ---
    return (
        <Form {...form}>
            {/* 💡 FIX: Conditionally render the form only when all data is loaded and state is stable */}
            {!isReady ? (
                <div className="md:col-span-3 py-8 text-center text-gray-500">Loading task details...</div>
            ) : (
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                    
                    <FormField control={form.control} name="preset_task_id" render={({ field }) => (<FormItem className="md:col-span-3"><FormLabel>Select a Preset Task (Optional)</FormLabel><Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger></FormControl><SelectContent>{presetTasks.map(pt => <SelectItem key={pt.id} value={pt.id.toString()}>{pt.preset_task_name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="task_name" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Task Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="due_date" render={({ field }) => (<FormItem><FormLabel>Due Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                    
                    {/* Property Select */}
                    <FormField control={form.control} name="property_id" render={({ field }) => (<FormItem><FormLabel>Property</FormLabel><Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger><SelectValue placeholder="Select a property" /></SelectTrigger></FormControl><SelectContent>{properties.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    
                    {/* Room Type Select */}
                    <FormField control={form.control} name="room_type_id" render={({ field }) => (<FormItem><FormLabel>Room Type</FormLabel><Select onValueChange={field.onChange} value={field.value || ''} disabled={!propertyId}><FormControl><SelectTrigger><SelectValue placeholder={!propertyId ? "Select property first" : "Select a room type"} /></SelectTrigger></FormControl><SelectContent>{roomTypes.map(rt => <SelectItem key={rt.id} value={rt.id.toString()}>{rt.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    
                    {/* Unit Select */}
                    <FormField control={form.control} name="unit_id" render={({ field }) => (<FormItem><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange} value={field.value || ''} disabled={!roomTypeId}><FormControl><SelectTrigger><SelectValue placeholder={!roomTypeId ? "Select room type first" : "Select a unit"} /></SelectTrigger></FormControl><SelectContent>{units.map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.unit_identifier}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    
                    <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="priority" render={({ field }) => (<FormItem><FormLabel>Priority</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{priorityOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="num_of_cleaners" render={({ field }) => (<FormItem><FormLabel>Number of Cleaners</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? null : e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="cleaning_team_id" render={({ field }) => (<FormItem><FormLabel>Cleaning Team</FormLabel><Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger><SelectValue placeholder="Assign a team" /></SelectTrigger></FormControl><SelectContent>{cleaningTeams.map(ct => <SelectItem key={ct.id} value={ct.id.toString()}>{ct.team_name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="checklist_id" render={({ field }) => (<FormItem><FormLabel>Checklist</FormLabel><Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger><SelectValue placeholder="Attach a checklist" /></SelectTrigger></FormControl><SelectContent>{checklists.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.checklist_name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="host_notes" render={({ field }) => (<FormItem className="md:col-span-3"><FormLabel>Host Notes</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="remarks" render={({ field }) => (<FormItem className="md:col-span-3"><FormLabel>Internal Remarks</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                    
                    <div className="md:col-span-3 flex justify-end">
                        <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'Saving...' : 'Save'}</Button>
                    </div>
                </form>
            )}
        </Form>
    );
}