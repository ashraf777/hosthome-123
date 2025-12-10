"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from '@/services/api';
import { useToast } from "@/hooks/use-toast";

/**
 * Parses the raw log_entry string into a structured object suitable for rendering.
 * Example input: "Updated 'status' from 'In Progress' to 'Paused'.\nUpdated 'due_date' from '2025-12-12T00:00:00.000000Z' to '2025-12-12 00:00:00'."
 * Example output: { status: { old: 'In Progress', new: 'Paused' }, due_date: { old: '...', new: '...' } }
 */
const parseLogEntry = (logEntry) => {
    if (!logEntry) return {};
    
    // Regex to match the pattern: Updated 'field' from 'old' to 'new'
    // It captures the field name (key), the old value, and the new value.
    const regex = /Updated\s+'([^']+)'\s+from\s+'([^']+)'\s+to\s+'([^']+)'/g;
    let match;
    const changes = {};

    while ((match = regex.exec(logEntry)) !== null) {
        const key = match[1];
        const oldValue = match[2];
        const newValue = match[3];

        changes[key] = {
            old: oldValue,
            new: newValue,
        };
    }
    return changes;
};

export function TaskLogs({ taskId }) {
    const { toast } = useToast();
    // logs state will now store the fetched logs WITH the parsed changes object
    const [logs, setLogs] = useState([]); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const response = await api.get(`tasks/${taskId}/logs`);
                
                // 💡 FIX: Map over the fetched data and parse the log_entry string
                const parsedLogs = (response.data || []).map(log => ({
                    ...log,
                    // Inject the parsed changes object into the log item
                    changes: parseLogEntry(log.log_entry), 
                }));

                setLogs(parsedLogs);
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to fetch task logs." });
            }
            setLoading(false);
        };

        if (taskId) {
            fetchLogs();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [taskId]);

    // --- Render Logic (Unchanged but now works with parsed data) ---
    if (loading) {
        return <div>Loading logs...</div>;
    }

    if (logs.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Task Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>No activity logs found for this task.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Task Logs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                {logs.map((log) => (
                    <div key={log.id} className="relative pl-8">
                        <div className="absolute left-0 top-1 h-full border-l-2 border-gray-200"></div>
                        <div className="absolute left-[-6px] top-1 w-4 h-4 bg-gray-200 rounded-full"></div>
                        {/* Assuming action_type is missing from API but log_entry is present */}
                        <p className="font-semibold text-lg capitalize">Task Update</p> 
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-sm mt-2">
                            <div>
                                <span className="font-medium">Logged At: </span>
                                <span>{new Date(log.created_at).toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="font-medium">Updated By: </span>
                                <span className="font-bold text-blue-600">{log.user?.name || 'System'}</span>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <p className="font-medium">Changes:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-md">
                                {/* This section now correctly uses the injected log.changes */}
                                {Object.entries(log.changes).map(([key, value]) => (
                                    <div key={key} className="flex flex-col">
                                        {/* Use replace to format keys like 'due_date' to 'Due Date' */}
                                        <span className="font-semibold capitalize">{key.replace(/_/g, ' ')}</span>
                                        <div>
                                            <span className="text-red-500 line-through">{value.old ?? 'N/A'}</span>
                                            <span> &rarr; </span>
                                            <span className="text-green-500">{value.new ?? 'N/A'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {Object.keys(log.changes || {}).length === 0 && <p className="text-sm text-gray-500">No specific field changes recorded.</p>}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}