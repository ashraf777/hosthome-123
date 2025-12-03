
"use client";

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function PresetTaskForm({ task }) {
    const [cleanerCount, setCleanerCount] = useState(task?.cleanerCount || 1);

    const increment = () => setCleanerCount(prev => prev + 1);
    const decrement = () => setCleanerCount(prev => (prev > 1 ? prev - 1 : 1));

    return (
        <div className="grid grid-cols-2 gap-4 p-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Task Name *</label>
                <Input defaultValue={task?.taskName} placeholder="Enter task name" />
            </div>
            <div></div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Property *</label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="property1">Property 1</SelectItem>
                        <SelectItem value="property2">Property 2</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Room Type *</label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select at least one room type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="room1">Room 1</SelectItem>
                        <SelectItem value="room2">Room 2</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Unit *</label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select at least one unit" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="unit1">Unit 1</SelectItem>
                        <SelectItem value="unit2">Unit 2</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Trigger Type *</label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select type of trigger" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="trigger1">Trigger 1</SelectItem>
                        <SelectItem value="trigger2">Trigger 2</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Cleaning Team</label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a cleaning team" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="team1">Team 1</SelectItem>
                        <SelectItem value="team2">Team 2</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Number of Cleaner *</label>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={decrement}>-</Button>
                    <Input type="number" value={cleanerCount} readOnly className="w-16 text-center" />
                    <Button variant="outline" size="icon" onClick={increment}>+</Button>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Checklist Applied</label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a checklist to apply" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="checklist1">Checklist 1</SelectItem>
                        <SelectItem value="checklist2">Checklist 2</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Remark</label>
                <Textarea placeholder="Enter your remark here" />
            </div>
        </div>
    );
}
