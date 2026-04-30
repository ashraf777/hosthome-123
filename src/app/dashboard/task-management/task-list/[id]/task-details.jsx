
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { api } from '@/services/api';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { PhotoGallery } from "@/components/photo-gallery";
import { Camera, MessageSquare, Clock, User } from 'lucide-react';

const statusOptions = ['To Do', 'In Progress', 'Paused', 'Completed', 'Cancelled'];
const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];

const statusBadgeClass = {
    'To Do':       'bg-gray-100 text-gray-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed':   'bg-green-100 text-green-800',
    'Cancelled':   'bg-red-100 text-red-800',
    'Paused':      'bg-yellow-100 text-yellow-800',
};

/**
 * Cleaner Proof of Work — fetches media uploaded via the Flutter cleaner app.
 */
function CleanerProofMedia({ taskId }) {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!taskId) return;
        api.get(`cleaner/tasks/${taskId}/media`)
            .then(res => setMedia(res.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [taskId]);

    if (loading) {
        return <p className="text-sm text-muted-foreground animate-pulse">Loading cleaner uploads...</p>;
    }

    if (media.length === 0) {
        return (
            <p className="text-sm text-muted-foreground flex items-center gap-2 py-2">
                <Camera className="h-4 w-4" />
                No proof media uploaded by cleaners yet.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {media.map((item) => (
                <div key={item.id} className="border rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 border-b">
                        <Badge variant="outline" className={statusBadgeClass[item.status_at_upload] || ''}>
                            {item.status_at_upload}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                            <User className="h-3 w-3" />
                            {item.uploaded_by}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(item.created_at).toLocaleString()}
                        </span>
                    </div>
                    <div className="p-3 grid gap-3 sm:grid-cols-2">
                        {item.media_type === 'image' ? (
                            <a href={item.media_url} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={item.media_url}
                                    alt="Cleaner proof"
                                    className="rounded-md w-full object-cover max-h-60 hover:opacity-90 transition-opacity border"
                                />
                            </a>
                        ) : (
                            <video controls className="rounded-md w-full max-h-60 border">
                                <source src={item.media_url} />
                            </video>
                        )}
                        {item.note && (
                            <div className="flex gap-2 items-start text-sm">
                                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <p className="text-foreground">{item.note}</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

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
                        {task.accepted_at && (
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Accepted by Cleaner</label>
                                <p className="text-sm">{new Date(task.accepted_at).toLocaleString()}</p>
                            </div>
                        )}
                        {task.blocked_reason && (
                            <div className="space-y-1 col-span-2">
                                <label className="text-sm font-medium text-yellow-700">Blocked / Paused Reason</label>
                                <p className="text-sm bg-yellow-50 border border-yellow-200 rounded px-2 py-1">{task.blocked_reason}</p>
                            </div>
                        )}
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

            {/* Cleaner App Proof of Work — NEW */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Cleaner Proof of Work
                    </CardTitle>
                    <CardDescription>
                        Photos, videos, and notes submitted by cleaners via the mobile app.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CleanerProofMedia taskId={task.id} />
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
