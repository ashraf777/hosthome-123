
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CleaningTeamForm } from '../cleaning-team-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft } from 'lucide-react';

const formSchema = z.object({
    hosting_company_id: z.number().min(1, "Hosting company is required"),
    team_name: z.string().min(1, "Team name is required"),
    team_leader_id: z.number().nullable(),
    members: z.array(z.number()),
    is_active: z.boolean(),
});

export default function CleaningTeamDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            hosting_company_id: undefined,
            team_name: "",
            team_leader_id: null,
            members: [],
            is_active: true,
        },
    });

    useEffect(() => {
        if (id) {
            api.getCleaningTeam(id)
                .then(response => {
                    const teamData = response.data;
                    setTeam(teamData);
                    form.reset({
                        hosting_company_id: teamData.hosting_company_id,
                        team_name: teamData.team_name,
                        team_leader_id: teamData.team_leader_id,
                        members: teamData.members.map(m => m.id),
                        is_active: teamData.is_active,
                    });
                    setLoading(false);
                })
                .catch(error => {
                    toast({ variant: "destructive", title: "Error", description: "Failed to fetch team details." });
                    setLoading(false);
                });
        }
    }, [id, form, toast]);

    const onSubmit = async (values) => {
        try {
            await api.updateCleaningTeam(id, values);
            await api.syncTeamMembers(id, values.members);
            toast({ title: "Success", description: "Cleaning team updated successfully." });
            router.push('/dashboard/task-management/cleaning-team');
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    };

    const handleDelete = async () => {
        try {
            await api.deleteCleaningTeam(id);
            toast({ title: "Success", description: "Cleaning team deleted successfully." });
            router.push('/dashboard/task-management/cleaning-team');
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete team." });
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!team) {
        return <div>Team not found.</div>;
    }

    return (
        <div className="p-4">
             <Button onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Edit Cleaning Team</CardTitle>
                </CardHeader>
                <CardContent>
                    <CleaningTeamForm form={form} team={team} />
                    <div className="flex justify-end space-x-2 mt-4">
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">Delete Team</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the cleaning team.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
