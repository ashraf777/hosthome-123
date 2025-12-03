
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus } from "lucide-react";

export function TaskDetails({ task }) {
    // Since the task object is passed as a prop, we don't need to fetch it here.
    // We can directly use the task object to display the details.

    if (!task) {
        return <div>Loading task details...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirmation Code</label>
                        <p className="mt-1 text-sm text-gray-900">{task.id}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <p className="mt-1 text-sm text-gray-900">{task.status}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Assign Date</label>
                        <p className="mt-1 text-sm text-gray-900">{new Date(task.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Time</label>
                        <Input type="datetime-local" defaultValue={new Date(task.createdAt).toISOString().slice(0,16)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Time</label>
                        <Input type="datetime-local" />
                    </div>
                    <div/>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Team Name</label>
                         <Select defaultValue={task.teamName}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ngpuisi">ngpuisi</SelectItem>
                                <SelectItem value="Cleaner ANA">Cleaner ANA</SelectItem>
                                <SelectItem value="Aunty Gan maintenance team">Aunty Gan maintenance team</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                        <Select defaultValue={task.priority}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Urgent">Urgent</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Number of Cleaner</label>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon"><Minus className="h-4 w-4" /></Button>
                            <Input className="w-16 text-center" type="number" defaultValue={1} />
                            <Button variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Checklist</label>
                        <p className="mt-1 text-sm text-gray-900">Maintenance task</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cleaner</label>
                         <Select defaultValue={task.cleanerName}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="kim">kim</SelectItem>
                                <SelectItem value="ayuman owner">ayuman owner</SelectItem>
                                <SelectItem value="john">john</SelectItem>
                                <SelectItem value="jane">jane</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <h3 className="text-lg font-medium">Room Details</h3>
                <div className="grid grid-cols-3 gap-4 border-t pt-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Property</label>
                        <p className="mt-1 text-sm text-gray-900">{task.propertyName || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Room Type</label>
                        <p className="mt-1 text-sm text-gray-900">{task.roomType || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Unit Name</label>
                        <p className="mt-1 text-sm text-gray-900">{task.unitName || 'N/A'}</p>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Host Notes</label>
                    <Textarea defaultValue="Table broken" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">File(s) Upload</label>
                    {/* Placeholder for file upload component */}
                    <div className="w-full h-32 border-dashed border-2 flex items-center justify-center">
                        <p>File upload placeholder</p>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Remarks</label>
                    <Textarea placeholder="Leave your message here..." />
                </div>
                <div className="flex justify-end space-x-2">
                    <Button variant="outline">Close</Button>
                    <Button>Delete</Button>
                </div>
            </CardContent>
        </Card>
    );
}
