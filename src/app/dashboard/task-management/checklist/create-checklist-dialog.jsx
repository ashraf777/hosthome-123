
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";

export function CreateChecklistDialog({ isOpen, onOpenChange }) {
    const [items, setItems] = useState(['']);

    const handleItemChange = (index, value) => {
        const newItems = [...items];
        newItems[index] = value;
        setItems(newItems);
    };

    const handleAddItem = () => {
        setItems([...items, '']);
    };

    const handleRemoveItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create Checklist</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="host-name" className="block text-sm font-medium text-gray-700">Host Name</label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a host" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="feel-home">Feel Home Malaysia Sdn Bhd</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label htmlFor="checklist-name" className="block text-sm font-medium text-gray-700">Checklist Name</label>
                            <Input id="checklist-name" placeholder="eg. Genting w/ coffee pack" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="property-applied" className="block text-sm font-medium text-gray-700">Property Applied</label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Select at least one property" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="agile">Agile, B-02-03</SelectItem>
                                <SelectItem value="beta">Beta, C-05-01</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Item Name</label>
                        {items.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    value={item}
                                    onChange={(e) => handleItemChange(index, e.target.value)}
                                    placeholder="e.g. Bedsheet, vacuum"
                                />
                                {items.length > 1 && (
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div>
                        <Button variant="outline" onClick={handleAddItem}>+ Add new item</Button>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                         <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                    <Button type="submit">Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
