
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { PresetTaskDialog } from '../preset-task-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function PresetTaskDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();
    const [presetTask, setPresetTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const fetchPresetTask = () => {
        setLoading(true);
        api.get(`preset-tasks/${id}`)
            .then(response => {
                setPresetTask(response.data);
            })
            .catch(error => {
                toast({ variant: "destructive", title: "Error", description: "Failed to fetch preset task details." });
            })
            .finally(() => {
                setLoading(false);
            });
    }

    useEffect(() => {
        if (id) {
            fetchPresetTask();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleUpdate = () => {
        fetchPresetTask();
    };

    const handleDelete = async () => {
        try {
            await api.delete(`preset-tasks/${id}`);
            toast({ title: "Success", description: "Preset task deleted successfully." });
            router.push('/dashboard/task-management/preset-task');
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    };

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    if (!presetTask) {
        return <div className="p-4">Preset task not found.</div>;
    }

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <Button onClick={() => router.back()} variant="ghost" className="flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Preset Tasks
                </Button>
                <div className="flex space-x-2">
                    <Button onClick={() => setIsEditDialogOpen(true)} variant="outline">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button onClick={() => setIsDeleteDialogOpen(true)} variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">{presetTask.preset_task_name}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><span className="font-semibold">Trigger:</span> {presetTask.trigger_type}</div>
                    {presetTask.property && <div><span className="font-semibold">Property:</span> {presetTask.property.name}</div>}
                    {presetTask.room_type && <div><span className="font-semibold">Room Type:</span> {presetTask.room_type.name}</div>}
                    {presetTask.unit && <div><span className="font-semibold">Unit:</span> {presetTask.unit.unit_identifier}</div>}
                    {presetTask.cleaning_team && <div><span className="font-semibold">Cleaning Team:</span> {presetTask.cleaning_team.team_name}</div>}
                    {presetTask.num_of_cleaners && <div><span className="font-semibold">Cleaners:</span> {presetTask.num_of_cleaners}</div>}
                    {presetTask.checklist && <div><span className="font-semibold">Checklist:</span> {presetTask.checklist.checklist_name}</div>}
                    {presetTask.remark && <div className="md:col-span-2"><span className="font-semibold">Remark:</span> {presetTask.remark}</div>}
                </CardContent>
            </Card>

            <PresetTaskDialog
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onPresetTaskUpdated={handleUpdate}
                presetTask={presetTask}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this preset task?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
