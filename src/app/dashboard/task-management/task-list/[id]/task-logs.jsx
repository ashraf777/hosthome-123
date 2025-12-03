
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const logs = [
    {
        action: "Create",
        timestamp: "15-Aug-2023 14:37",
        user: "Kimberly Ng",
        details: {
            "Status": "Pending Cleaner",
            "Priority": "Urgent",
            "Team Name": "Aunty Gan maintenance team",
            "Checklist": "Maintenance Job",
            "Number of Cleaner": 1,
            "Host Notes": "table broken",
            "Remarks": "-"
        }
    },
    {
        action: "Update",
        timestamp: "15-Aug-2023 14:40",
        user: "XiangNi Gan",
        details: {
            "Status": "In Progress",
            "Priority": "Urgent",
            "Team Name": "Aunty Gan maintenance team",
            "Checklist": "Maintenance Job",
            "Number of Cleaner": 1,
            "Host Notes": "table broken",
            "Remarks": "-"
        }
    },
    {
        action: "Update",
        timestamp: "15-Aug-2023 14:40",
        user: "XiangNi Gan",
        details: {
            "Status": "Completed",
            "Priority": "Urgent",
            "Team Name": "Aunty Gan maintenance team",
            "Checklist": "Maintenance Job",
            "Number of Cleaner": 1,
            "Host Notes": "table broken",
            "Remarks": "-"
        }
    }
];

export function TaskLogs() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Task Logs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                {logs.map((log, index) => (
                    <div key={index} className="relative pl-8">
                        <div className="absolute left-0 top-1 h-full border-l-2 border-gray-200"></div>
                        <div className="absolute left-[-6px] top-1 w-4 h-4 bg-gray-200 rounded-full"></div>
                        <p className="font-semibold text-lg">{log.action}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm mt-2">
                            <div>
                                <span className="font-medium">Updated At: </span>
                                <span>{log.timestamp}</span>
                            </div>
                             <div>
                                <span className="font-medium">Updated At: </span>
                                <span className="font-bold text-blue-600">{log.user}</span>
                            </div>
                            {Object.entries(log.details).map(([key, value]) => (
                               <div key={key}>
                                    <span className="font-medium">{key}: </span>
                                    <span className={key === 'Status' ? 'font-bold text-green-600' : ''}>{value}</span>
                               </div>
                            ))}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
