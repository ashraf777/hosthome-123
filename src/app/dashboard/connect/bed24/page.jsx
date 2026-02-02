"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Loader2, RefreshCw } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function Bed24ConnectPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    // Load state from localStorage on mount
    React.useEffect(() => {
        const storedState = localStorage.getItem('bed24_connected');
        if (storedState === 'true') {
            setIsConnected(true);
        }
    }, []);

    const handleSave = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsConnected(true);
            localStorage.setItem('bed24_connected', 'true');
        }, 1500);
    };

    const handleReconfigure = () => {
        setIsConnected(false);
        localStorage.removeItem('bed24_connected');
    };

    const mockProperties = [
        { id: 101, name: "Sunset Villa - Ocean View", channel: "Airbnb", channelId: "ABNB-882392", status: "Live", lastSync: "10 mins ago" },
        { id: 102, name: "Downtown Loft Apartment", channel: "Booking.com", channelId: "BKNG-29384", status: "Live", lastSync: "2 mins ago" },
        { id: 103, name: "Mountain Cabin Retreat", channel: "Airbnb", channelId: "ABNB-992384", status: "Syncing", lastSync: "Just now" },
        { id: 104, name: "Luxury City Condo", channel: "Expedia", channelId: "EXP-11223", status: "Error", lastSync: "1 day ago" },
        { id: 105, name: "Cozy Studio by the Park", channel: "Airbnb", channelId: "ABNB-773822", status: "Live", lastSync: "1 hour ago" },
    ];

    const getChannelBadge = (channel) => {
        switch (channel) {
            case 'Airbnb': return <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">Airbnb</Badge>;
            case 'Booking.com': return <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">Booking.com</Badge>;
            default: return <Badge variant="outline">{channel}</Badge>;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Live': return <Badge className="bg-green-600">Live</Badge>;
            case 'Syncing': return <Badge variant="secondary" className="animate-pulse">Syncing</Badge>;
            case 'Error': return <Badge variant="destructive">Error</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Bed24 Connection</h1>
                {isConnected && (
                    <Badge variant="outline" className="border-green-500 text-green-600 gap-1 px-3 py-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Connected
                    </Badge>
                )}
            </div>
            <Separator />

            <div className="grid gap-6">
                {/* CONFIGURATION CARD - Full Width */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Configuration</CardTitle>
                        <CardDescription>
                            Enter your Bed24 API credentials to connect your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="token">API Token</Label>
                            <Input
                                id="token"
                                placeholder="Enter your Bed24 API token"
                                disabled={isConnected || isLoading}
                                defaultValue={isConnected ? "**********************" : ""}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="apiUrl">Bed24 API URL</Label>
                            <Input
                                id="apiUrl"
                                placeholder="https://api.bed24.com/..."
                                disabled={isConnected || isLoading}
                                defaultValue={isConnected ? "https://api.bed24.com/v2/" : ""}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        {!isConnected ? (
                            <Button onClick={handleSave} disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLoading ? "Connecting..." : "Save & Connect"}
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 pointer-events-none">
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Connection Established
                                </Button>
                                <Button variant="ghost" onClick={handleReconfigure}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Reconfigure
                                </Button>
                            </div>
                        )}
                    </CardFooter>
                </Card>

                {/* IMPORTED PROPERTIES TABLE */}
                {isConnected && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">Imported Properties</h2>
                                <p className="text-sm text-muted-foreground">Properties syndicated from your Bed24 account.</p>
                            </div>
                            <Button variant="outline" size="sm">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Sync Now
                            </Button>
                        </div>

                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Property Name</TableHead>
                                        <TableHead>Channel</TableHead>
                                        <TableHead>Channel ID</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right pr-6">Last Sync</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockProperties.map((property) => (
                                        <TableRow key={property.id}>
                                            <TableCell className="font-medium pl-6">{property.name}</TableCell>
                                            <TableCell>{getChannelBadge(property.channel)}</TableCell>
                                            <TableCell className="text-mono text-xs text-muted-foreground">{property.channelId}</TableCell>
                                            <TableCell>{getStatusBadge(property.status)}</TableCell>
                                            <TableCell className="text-right text-muted-foreground pr-6">{property.lastSync}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
