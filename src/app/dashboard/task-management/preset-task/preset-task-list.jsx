
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PresetTaskDialog } from "./preset-task-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const presetTasksData = [
  {
    id: 1,
    presetTaskName: 'Standard Clean',
    propertyName: 'Agile B-02-03',
    cleaningTeam: 'Kry',
    numberOfCleaner: 2,
    checklistUse: 'Standard Checklist',
  },
  {
    id: 2,
    presetTaskName: 'Deep Clean',
    propertyName: 'Agile B-02-04',
    cleaningTeam: 'Feel Home',
    numberOfCleaner: 4,
    checklistUse: 'Deep Clean Checklist',
  },
];

export function PresetTaskList() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [presetTasks, setPresetTasks] = useState([]);

    useEffect(() => {
        setPresetTasks(presetTasksData);
    }, []);

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <Button onClick={() => setIsDialogOpen(true)}>+ Create Preset Task</Button>
                <Button variant="outline">Download CSV</Button>
            </div>
            <div className="border rounded-lg p-4">
                <div className="grid grid-cols-5 gap-4 mb-4">
                    <Input placeholder="Preset Task Name" />
                    <Input placeholder="Property Name" />
                    <Input placeholder="Cleaning Team" />
                    <Input placeholder="# of Cleaner" />
                    <Input placeholder="Checklist use" />
                </div>
                {presetTasks.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Preset Task Name</TableHead>
                                <TableHead>Property Name</TableHead>
                                <TableHead>Cleaning Team</TableHead>
                                <TableHead># of Cleaner</TableHead>
                                <TableHead>Checklist use</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {presetTasks.map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell>{task.presetTaskName}</TableCell>
                                    <TableCell>{task.propertyName}</TableCell>
                                    <TableCell>{task.cleaningTeam}</TableCell>
                                    <TableCell>{task.numberOfCleaner}</TableCell>
                                    <TableCell>{task.checklistUse}</TableCell>
                                    <TableCell>
                                        <Link href={`/dashboard/task-management/preset-task/${task.id}`}>
                                            <Button variant="ghost">Edit</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-16">
                        <div className="inline-block bg-gray-100 p-4 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7m-4 4l-4 4m0 0l-4-4m4 4V3" />
                            </svg>
                        </div>
                        <p className="mt-4 text-gray-500">No Data</p>
                    </div>
                )}
            </div>
            <PresetTaskDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </div>
    );
}
