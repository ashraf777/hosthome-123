
"use client";

import { PresetTaskForm } from "../preset-task-form";
import { Button } from "@/components/ui/button";

const taskData = {
    id: 1,
    taskName: 'Daily Cleaning',
    property: 'property1',
    roomType: 'room1',
    unit: 'unit1',
    triggerType: 'trigger1',
    cleaningTeam: 'team1',
    cleanerCount: 2,
    checklistApplied: 'checklist1',
    remark: 'This is a daily cleaning task.'
};

export default function EditPresetTaskPage() {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Edit Preset Task</h1>
            <PresetTaskForm task={taskData} />
            <div className="mt-4 flex gap-2">
                <Button>Save</Button>
                <Button variant="destructive">Delete</Button>
            </div>
        </div>
    );
}
