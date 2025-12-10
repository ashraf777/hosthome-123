"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
    preset_task_name: z.string().min(1, "Task name is required"),
    property_id: z.string().nullable(),
    room_type_id: z.string().nullable(),
    unit_id: z.string().nullable(), 
    trigger_type: z.string().min(1, "Trigger type is required"),
    cleaning_team_id: z.string().nullable(),
    num_of_cleaners: z.preprocess((val) => (val === "" || val === null) ? null : parseInt(String(val), 10), z.number().nullable()),
    checklist_id: z.string().nullable(),
    remark: z.string().nullable(),
});

export function PresetTaskDialog({ isOpen, onOpenChange, onPresetTaskCreated, onPresetTaskUpdated, presetTask }) {
    const { toast } = useToast();
    const [properties, setProperties] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [units, setUnits] = useState([]);
    const [cleaningTeams, setCleaningTeams] = useState([]);
    const [checklists, setChecklists] = useState([]);
    const [isReady, setIsReady] = useState(false); // 👈 New state to guard rendering
    
    const initialPresetTask = useRef(null); 
    const isFormLoaded = useRef(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            preset_task_name: '',
            property_id: null,
            room_type_id: null,
            unit_id: null,
            trigger_type: '',
            cleaning_team_id: null,
            num_of_cleaners: null,
            checklist_id: null,
            remark: '',
        },
    });

    const propertyId = form.watch('property_id');
    const roomTypeId = form.watch('room_type_id');

    // --- 1. Initial Setup and Data Fetching ---
    useEffect(() => {
        if (!isOpen) {
            // Cleanup on close
            initialPresetTask.current = null; 
            isFormLoaded.current = false;
            setIsReady(false);
            return;
        }

        const setupForm = async () => {
            setIsReady(false); // Start by hiding the form

            try {
                // Fetch static/base data concurrently
                const [propRes, teamRes, checkRes] = await Promise.all([
                    api.get('properties'),
                    api.get('cleaning-teams'),
                    api.get('checklists')
                ]);
                
                // Update base state immediately (still async, but done before nested fetch)
                setProperties(propRes.data || []);
                setCleaningTeams(teamRes.data || []);
                setChecklists(checkRes.data || []);

                // Prepare for conditional form reset
                let resetValues = { /* default values */ };
                let initialRoomTypes = [];
                let initialUnits = [];
                
                if (presetTask) { // Edit Mode
                    initialPresetTask.current = presetTask; 
                    isFormLoaded.current = false;

                    // Fetch associated room types and units needed for dropdown options
                    if (presetTask.property_id) {
                         initialRoomTypes = (await api.get(`properties/${presetTask.property_id}/room-types`)).data || [];
                    }
                    if (presetTask.room_type_id) {
                         initialUnits = (await api.get(`units?room_type_id=${presetTask.room_type_id}`)).data || [];
                    }
                    
                    // Prepare preset task values for reset
                    resetValues = {
                        ...presetTask,
                        property_id: presetTask.property_id?.toString() || null,
                        room_type_id: presetTask.room_type_id?.toString() || null,
                        unit_id: presetTask.unit_id?.toString() || null,
                        cleaning_team_id: presetTask.cleaning_team_id?.toString() || null,
                        checklist_id: presetTask.checklist_id?.toString() || null,
                    };
                } else { // Create Mode
                    initialPresetTask.current = null; 
                    isFormLoaded.current = true; // Mark as loaded for create mode
                }

                // 2. GUARANTEE that all states are updated BEFORE form.reset()
                // Use the functional form of setState to ensure it happens in the same cycle
                setRoomTypes(initialRoomTypes);
                setUnits(initialUnits);
                
                // 3. Reset the form with the prepared values
                form.reset(resetValues);

                // 4. Mark the form as ready to render
                setIsReady(true);
                
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to load initial data." });
            }
        };

        setupForm();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, presetTask]);
    
    // --- 2. Property ID Watcher (Cascading Logic) ---
    useEffect(() => {
        if (!isOpen || !isReady) return; // Wait until form is ready

        const isInitialProperty = initialPresetTask.current?.property_id?.toString() === propertyId;
        const shouldClearDownstream = isFormLoaded.current && !isInitialProperty;

        if (!propertyId) {
            setRoomTypes([]);
            setUnits([]);
            form.setValue('room_type_id', null);
            form.setValue('unit_id', null);
            return;
        }

        api.get(`properties/${propertyId}/room-types`).then(res => {
            setRoomTypes(res.data || []);
            
            if (shouldClearDownstream) { 
                form.setValue('room_type_id', null);
                form.setValue('unit_id', null);
            }
            
            if (!isFormLoaded.current) {
                 isFormLoaded.current = true;
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propertyId, isReady]);

    // --- 3. Room Type ID Watcher (Cascading Logic) ---
    useEffect(() => {
        if (!isOpen || !isReady) return; // Wait until form is ready

        const isInitialRoomType = initialPresetTask.current?.room_type_id?.toString() === roomTypeId;
        const shouldClearDownstream = isFormLoaded.current && !isInitialRoomType;

        if (!roomTypeId) {
            setUnits([]);
            form.setValue('unit_id', null);
            return;
        }

        api.get(`units?room_type_id=${roomTypeId}`).then(res => {
            setUnits(res.data || []);

            if (shouldClearDownstream) {
                form.setValue('unit_id', null);
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomTypeId, isReady]);

    // --- 4. Form Submission (Unchanged) ---
    const onSubmit = async (values) => {
        try {
            const dataToSubmit = {
                ...values,
                property_id: values.property_id ? parseInt(values.property_id) : null,
                room_type_id: values.room_type_id ? parseInt(values.room_type_id) : null,
                unit_id: values.unit_id ? parseInt(values.unit_id) : null,
                cleaning_team_id: values.cleaning_team_id ? parseInt(values.cleaning_team_id) : null,
                checklist_id: values.checklist_id ? parseInt(values.checklist_id) : null,
            };

            if (presetTask) {
                await api.put(`preset-tasks/${presetTask.id}`, dataToSubmit);
                toast({ title: "Success", description: "Preset task updated successfully." });
                if (onPresetTaskUpdated) onPresetTaskUpdated();
            } else {
                await api.post('preset-tasks', dataToSubmit);
                toast({ title: "Success", description: "Preset task created successfully." });
                if (onPresetTaskCreated) onPresetTaskCreated();
            }
            onOpenChange(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || error.message });
        }
    };

    // --- 5. Component Render ---
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{presetTask ? 'Edit Preset Task' : 'Create Preset Task'}</DialogTitle>
                </DialogHeader>
                
                {/* 💡 FIX: Conditionally render the form only when all data is loaded and state is stable */}
                {!isReady ? (
                    <div className="py-8 text-center text-gray-500">Loading preset task details...</div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            
                            {/* ... All FormFields remain the same ... */}
                            <FormField control={form.control} name="preset_task_name" render={({ field }) => (<FormItem><FormLabel>Task Name</FormLabel><FormControl><Input {...field} placeholder="e.g. Post-Checkout Cleaning" /></FormControl><FormMessage /></FormItem>)} />
                            
                            <FormField control={form.control} name="trigger_type" render={({ field }) => (<FormItem><FormLabel>Trigger</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a trigger" /></SelectTrigger></FormControl><SelectContent><SelectItem value="check-in">On Check-in</SelectItem><SelectItem value="check-out">On Check-out</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            
                            {/* Property Select */}
                            <FormField control={form.control} name="property_id" render={({ field }) => (<FormItem><FormLabel>Property</FormLabel><Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger><SelectValue placeholder="Select a property" /></SelectTrigger></FormControl><SelectContent>{properties.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                            
                            {/* Room Type Select */}
                            <FormField control={form.control} name="room_type_id" render={({ field }) => (<FormItem><FormLabel>Room Type</FormLabel><Select onValueChange={field.onChange} value={field.value || ''} disabled={!propertyId}><FormControl><SelectTrigger><SelectValue placeholder={!propertyId ? "Select a property first" : "Select a room type"} /></SelectTrigger></FormControl><SelectContent>{roomTypes.map(rt => <SelectItem key={rt.id} value={rt.id.toString()}>{rt.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                            
                            {/* Unit Select */}
                            <FormField control={form.control} name="unit_id" render={({ field }) => (<FormItem><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange} value={field.value || ''} disabled={!roomTypeId}><FormControl><SelectTrigger><SelectValue placeholder={!roomTypeId ? "Select a room type first" : "Select a unit"} /></SelectTrigger></FormControl><SelectContent>{units.map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.unit_identifier}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                            
                            <FormField control={form.control} name="cleaning_team_id" render={({ field }) => (<FormItem><FormLabel>Cleaning Team</FormLabel><Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger><SelectValue placeholder="Select a team" /></SelectTrigger></FormControl><SelectContent>{cleaningTeams.map(ct => <SelectItem key={ct.id} value={ct.id.toString()}>{ct.team_name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                            
                            <FormField control={form.control} name="num_of_cleaners" render={({ field }) => (<FormItem><FormLabel>Number of Cleaners</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? null : e.target.valueAsNumber)} placeholder="e.g. 2" /></FormControl><FormMessage /></FormItem>)} />
                            
                            <FormField control={form.control} name="checklist_id" render={({ field }) => (<FormItem><FormLabel>Checklist</FormLabel><Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger><SelectValue placeholder="Select a checklist" /></SelectTrigger></FormControl><SelectContent>{checklists.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.checklist_name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                            
                            <FormField control={form.control} name="remark" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Remark</FormLabel><FormControl><Textarea {...field} placeholder="Add any extra details..." /></FormControl><FormMessage /></FormItem>)} />
                            
                            <DialogFooter className="md:col-span-2">
                                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'Saving...' : 'Save'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}