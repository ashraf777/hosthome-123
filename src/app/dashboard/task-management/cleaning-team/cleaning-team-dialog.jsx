
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { CleaningTeamForm } from "./cleaning-team-form";

export function CleaningTeamDialog({ isOpen, onOpenChange }) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Cleaning Team</DialogTitle>
                </DialogHeader>
                <CleaningTeamForm />
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
