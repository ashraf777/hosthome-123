
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from '@/services/api';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { PhotoGallery } from "@/components/photo-gallery"

const statusOptions = ['To Do', 'In Progress', 'Paused', 'Completed', 'Cancelled'];
const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];

export function TaskDetails({ task: initialTask }) {
    const { toast } = useToast();
    const router = useRouter();
    const [task, setTask] = useState(initialTask);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setTask(initialTask);
    }, [initialTask]);

    const handleFieldChange = async (field, value) => {
        const updatedTask = { ...task, [field]: value };
        setTask(updatedTask);
        setIsEditing(true);
    };

    const handleSaveChanges = async () => {
        try {
            await api.put(`tasks/${task.id}`, task);
            toast({ title: "Success", description: "Task updated successfully." });
            setIsEditing(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update task." });
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await api.delete(`tasks/${task.id}`);
                toast({ title: "Success", description: "Task deleted successfully." });
                router.push('/dashboard/task-management/task-list');
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to delete task." });
            }
        }
    };

    if (!task) {
        return <div>Loading task details...</div>;
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Task Details</CardTitle>
                    <div className="flex items-center gap-2">
                        {isEditing && <Button onClick={handleSaveChanges}>Save Changes</Button>}
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                        <Button variant="outline" onClick={() => router.back()}>Close</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Task Name</label>
                            <p>{task.task_name}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Status</label>
                            <Select value={task.status} onValueChange={(value) => handleFieldChange('status', value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Priority</label>
                            <Select value={task.priority} onValueChange={(value) => handleFieldChange('priority', value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{priorityOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Due Date</label>
                            <p>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Created At</label>
                            <p>{new Date(task.created_at).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Last Updated</label>
                            <p>{new Date(task.updated_at).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Property</label>
                            <p>{task.property?.name || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Room Type</label>
                            <p>{task.room_type?.name || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Unit</label>
                            <p>{task.unit?.unit_identifier || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Cleaning Team</label>
                            <p>{task.cleaning_team?.team_name || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Checklist</label>
                            <p>{task.checklist?.checklist_name || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Number of Cleaners</label>
                            <Input type="number" value={task.num_of_cleaners || ''} onChange={(e) => handleFieldChange('num_of_cleaners', e.target.valueAsNumber)} />
                        </div>
                    </div>
                    
                    <div className="space-y-4 border-t pt-6">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Host Notes</label>
                            <Textarea value={task.host_notes || ''} onChange={(e) => handleFieldChange('host_notes', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Internal Remarks</label>
                            <Textarea value={task.remarks || ''} onChange={(e) => handleFieldChange('remarks', e.target.value)} />
                        </div>
                    </div>

                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Task Photos</CardTitle>
                    <CardDescription>Manage photos for this Task.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PhotoGallery 
                        photoType="task" 
                        photoTypeId={task.id} 
                        hostingCompanyId={task.hosting_company_id}
                    />
                </CardContent>
            </Card>
        </>
    );
}
