"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Copy, RefreshCw, Clock, Smartphone, Wifi, WifiOff } from 'lucide-react';

/**
 * CleanerPinRequests
 * Polls the backend every 15 seconds for pending cleaner PIN requests.
 * Shown in the Task Management admin panel so admins can relay PINs to cleaners.
 */
export function CleanerPinRequests() {
    const { toast } = useToast();
    const [pendingPins, setPendingPins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState(null);

    const fetchPendingPins = useCallback(async () => {
        try {
            const response = await api.get('cleaner/auth/pending-pins');
            setPendingPins(response.data || []);
            setLastRefreshed(new Date());
        } catch (error) {
            // Silently fail on polling errors
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingPins();
        // Poll every 15 seconds
        const interval = setInterval(fetchPendingPins, 15000);
        return () => clearInterval(interval);
    }, [fetchPendingPins]);

    const copyPin = (pin, userName) => {
        navigator.clipboard.writeText(pin);
        toast({
            title: "PIN Copied",
            description: `PIN for ${userName} copied to clipboard.`,
        });
    };

    const getTimeRemaining = (expiresAt) => {
        const diff = new Date(expiresAt) - new Date();
        if (diff <= 0) return 'Expired';
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Smartphone className="h-4 w-4" />
                        Cleaner App Login Requests
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground animate-pulse">Checking for pending PIN requests...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Smartphone className="h-4 w-4" />
                            Cleaner App Login Requests
                            {pendingPins.length > 0 && (
                                <Badge variant="destructive" className="ml-1 text-xs">
                                    {pendingPins.length} Pending
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                            When a cleaner requests a PIN, it appears here. Relay the PIN to them verbally.
                        </CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={fetchPendingPins}
                        title="Refresh"
                    >
                        <RefreshCw className="h-3 w-3" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {pendingPins.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                        <Wifi className="h-4 w-4 text-green-500" />
                        No pending PIN requests right now.
                        {lastRefreshed && (
                            <span className="text-xs opacity-60 ml-auto">
                                Last checked {lastRefreshed.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pendingPins.map((req) => (
                            <div
                                key={req.user_id}
                                className="flex items-center justify-between p-3 rounded-lg border bg-yellow-50 border-yellow-200"
                            >
                                <div>
                                    <p className="text-sm font-medium">{req.user_name}</p>
                                    <p className="text-xs text-muted-foreground">{req.user_email}</p>
                                    <div className="flex items-center gap-1 mt-1 text-xs text-orange-600">
                                        <Clock className="h-3 w-3" />
                                        Expires: {getTimeRemaining(req.expires_at)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold font-mono tracking-widest text-primary">
                                            {req.pin}
                                        </p>
                                        <p className="text-xs text-muted-foreground">4-digit PIN</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="ml-2"
                                        onClick={() => copyPin(req.pin, req.user_name)}
                                    >
                                        <Copy className="h-3 w-3 mr-1" />
                                        Copy
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
