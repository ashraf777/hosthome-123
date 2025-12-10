
"use client";

import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { CleaningTeamForm } from "./cleaning-team-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
    hosting_company_id: z.number().min(1, "Hosting company is required"),
    team_name: z.string().min(1, "Team name is required"),
    team_leader_id: z.number().nullable(),
    members: z.array(z.number()),
    is_active: z.boolean(),
});

export function CleaningTeamDialog({ isOpen, onOpenChange, onTeamCreated }) {
    const { toast } = useToast();
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
        if (isOpen) {
            form.reset({
                hosting_company_id: undefined,
                team_name: "",
                team_leader_id: null,
                members: [],
                is_active: true,
            });
        }
    }, [isOpen, form]);

    const onSubmit = async (values) => {
        try {
            await api.createCleaningTeam(values);
            toast({ title: "Success", description: "Cleaning team created successfully." });
            form.reset();
            if (onTeamCreated) {
                onTeamCreated();
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Cleaning Team</DialogTitle>
                </DialogHeader>
                <CleaningTeamForm form={form} />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" onClick={() => form.reset()}>
                            Close
                        </Button>
                    </DialogClose>
                    <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Creating..." : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
