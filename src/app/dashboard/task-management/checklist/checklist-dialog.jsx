
"use client";

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusCircle, Trash2 } from 'lucide-react';

const formSchema = z.object({
    hosting_company_id: z.string().min(1, "Hosting company is required"),
    checklist_name: z.string().min(1, "Checklist name is required"),
    description: z.string().optional(),
    items: z.array(z.object({
        id: z.any().optional(),
        item_description: z.string().min(1, "Item description is required"),
    })).optional(),
});

export function ChecklistDialog({ isOpen, onOpenChange, onChecklistCreated, onChecklistUpdated, checklist }) {
    const { toast } = useToast();
    const [hostingCompanies, setHostingCompanies] = useState([]);

    const form = useForm({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (isOpen) {
            api.get('hosting-companies')
                .then(response => {
                    setHostingCompanies(response.data || []);
                })
                .catch(error => {
                    toast({ variant: "destructive", title: "Error", description: "Failed to fetch hosting companies." });
                });
            
            if (checklist) {
                form.reset({
                    hosting_company_id: checklist.hosting_company_id?.toString(),
                    checklist_name: checklist.checklist_name,
                    description: checklist.description,
                    items: checklist.items,
                });
            } else {
                form.reset({
                    hosting_company_id: '',
                    checklist_name: '',
                    description: '',
                    items: [{ item_description: '' }],
                });
            }
        }
    }, [checklist, form, isOpen, toast]);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const onSubmit = async (values) => {
        try {
            const dataToSubmit = {
                ...values,
                hosting_company_id: parseInt(values.hosting_company_id, 10),
            };

            if (checklist) {
                const originalItems = checklist.items.reduce((acc, item) => ({ ...acc, [item.id]: item }), {});
                const currentItems = values.items.reduce((acc, item) => item.id ? { ...acc, [item.id]: item } : acc, {});

                const newItems = values.items.filter(item => !item.id);
                const updatedItems = values.items.filter(item => item.id && (originalItems[item.id]?.item_description !== item.item_description));
                const deletedItemIds = checklist.items.filter(item => !currentItems[item.id]).map(item => item.id);

                await api.updateChecklist(checklist.id, { 
                    hosting_company_id: dataToSubmit.hosting_company_id,
                    checklist_name: dataToSubmit.checklist_name, 
                    description: dataToSubmit.description 
                });

                for (const item of newItems) {
                    await api.addChecklistItem(checklist.id, { item_description: item.item_description });
                }
                for (const item of updatedItems) {
                    await api.updateChecklistItem(checklist.id, item.id, { item_description: item.item_description });
                }
                for (const itemId of deletedItemIds) {
                    await api.deleteChecklistItem(checklist.id, itemId);
                }

                toast({ title: "Success", description: "Checklist updated successfully." });
                if (onChecklistUpdated) onChecklistUpdated();

            } else {
                await api.createChecklist(dataToSubmit);
                toast({ title: "Success", description: "Checklist created successfully." });
                if (onChecklistCreated) onChecklistCreated();
            }
            onOpenChange(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{checklist ? 'Edit Checklist' : 'Create Checklist'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="hosting_company_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hosting Company</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a hosting company" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {hostingCompanies.map(company => (
                                                <SelectItem key={company.id} value={company.id.toString()}>
                                                    {company.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="checklist_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Checklist Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Checklist Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Description (optional)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div>
                            <h4 className="text-lg font-semibold mb-2">Checklist Items</h4>
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-center space-x-2 mb-2">
                                    <Input
                                        {...form.register(`items.${index}.item_description`)}
                                        placeholder="Item Description"
                                    />
                                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" size="sm" variant="outline" onClick={() => append({ item_description: '' })}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Item
                            </Button>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Saving...' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
