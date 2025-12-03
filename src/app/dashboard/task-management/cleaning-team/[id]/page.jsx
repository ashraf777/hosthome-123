
"use client";

import { CleaningTeamForm } from "../cleaning-team-form";
import { Button } from "@/components/ui/button";

const teamData = {
    id: 1,
    teamName: 'Kry',
    host: 'Feel Home Malaysia Sdn Bhd',
    users: ['Mah Kok Leong', 'Gan XiangNi', 'XiangNi Gan'],
    properties: ['Agile B-02-03', 'Agile']
};

export default function EditCleaningTeamPage() {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Edit Cleaning Team</h1>
            <CleaningTeamForm team={teamData} />
            <div className="mt-4 flex gap-2">
                <Button>Save</Button>
                <Button variant="destructive">Delete</Button>
            </div>
        </div>
    );
}
