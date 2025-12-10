
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { ChecklistDialog } from '../checklist-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function ChecklistDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();
    const [checklist, setChecklist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const fetchChecklist = () => {
        setLoading(true);
        api.getChecklist(id)
            .then(response => {
                setChecklist(response.data);
            })
            .catch(error => {
                toast({ variant: "destructive", title: "Error", description: "Failed to fetch checklist details." });
            })
            .finally(() => {
                setLoading(false);
            });
    }

    useEffect(() => {
        if (id) {
            fetchChecklist();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleUpdate = () => {
        fetchChecklist();
    };

    const handleDelete = async () => {
        try {
            await api.deleteChecklist(id);
            toast({ title: "Success", description: "Checklist deleted successfully." });
            router.push('/dashboard/task-management/checklist');
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    };

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    if (!checklist) {
        return <div className="p-4">Checklist not found.</div>;
    }

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <Button onClick={() => router.back()} variant="ghost" className="flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Checklists
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
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl font-bold">{checklist.checklist_name}</CardTitle>
                            <CardDescription className="pt-2">{checklist.description}</CardDescription>
                        </div>
                        {checklist.hosting_company_name && (
                             <span className="text-sm font-medium bg-gray-100 text-gray-800 px-3 py-1 rounded-md">{checklist.hosting_company_name}</span>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <h3 className="text-xl font-semibold mb-4 border-t pt-4">Checklist Items</h3>
                    {checklist.items && checklist.items.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {checklist.items.map(item => (
                                <div key={item.id} className="bg-blue-100 text-blue-900 text-base font-medium px-4 py-2 rounded-lg flex items-center shadow-sm hover:shadow-md transition-shadow">
                                    {item.item_description}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 mt-4">This checklist has no items yet.</p>
                    )}
                </CardContent>
            </Card>

            <ChecklistDialog
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onChecklistUpdated={handleUpdate}
                checklist={checklist}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this checklist?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the checklist and all of its items.
                        </AlertDialogDescription>
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
