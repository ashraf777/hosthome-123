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
    const [refreshToken, setRefreshToken] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [properties, setProperties] = useState([]);
    const [error, setError] = useState("");

    // Load state from localStorage on mount
    React.useEffect(() => {
        const storedState = localStorage.getItem('bed24_connected');
        if (storedState === 'true') {
            setIsConnected(true);
            setRefreshToken(localStorage.getItem('bed24_refreshToken') || "");
            setAccessToken(localStorage.getItem('bed24_accessToken') || "");
            const storedProps = localStorage.getItem('bed24_properties');
            if (storedProps) {
                try {
                    setProperties(JSON.parse(storedProps));
                } catch (e) {
                    console.error("Failed to parse stored properties", e);
                }
            }
        }
    }, []);

    const handleSave = async () => {
        setIsLoading(true);
        setError("");
        try {
            // Step 1: Exchange Refresh Token for Access Token (via Proxy)
            const tokenResponse = await fetch('/api/bed24/token', {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'refreshToken': refreshToken
                }
            });

            if (!tokenResponse.ok) {
                const errData = await tokenResponse.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to authenticate. Please check your Refresh Token.");
            }

            const tokenData = await tokenResponse.json();
            const newAccessToken = tokenData.token;
            setAccessToken(newAccessToken);

            // Step 2: Fetch Properties using the Access Token (via Proxy)
            const propsResponse = await fetch('/api/bed24/properties', {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'token': newAccessToken
                }
            });

            if (!propsResponse.ok) {
                const errData = await propsResponse.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to fetch properties.");
            }

            const propsData = await propsResponse.json();

            if (!propsData.success) {
                throw new Error("API reported failure when fetching properties.");
            }

            const fetchedProperties = propsData.data || [];
            setProperties(fetchedProperties);

            // Step 3: Save execution state
            localStorage.setItem('bed24_connected', 'true');
            localStorage.setItem('bed24_refreshToken', refreshToken);
            localStorage.setItem('bed24_accessToken', newAccessToken);
            localStorage.setItem('bed24_properties', JSON.stringify(fetchedProperties));

            setIsConnected(true);

        } catch (err) {
            console.error(err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReconfigure = () => {
        setIsConnected(false);
        setAccessToken("");
        setProperties([]);
        localStorage.removeItem('bed24_connected');
        localStorage.removeItem('bed24_accessToken');
        // We keep the refreshToken in state/storage convenience so they don't have to re-paste it entirely if they just want to refresh
    };

    const handleSync = async () => {
        // Re-run the save logic to refresh token and data
        await handleSave();
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
                            Enter your Bed24 Refresh Token to connect your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="refreshToken">Refresh Token</Label>
                            <Input
                                id="refreshToken"
                                placeholder="Enter your Bed24 Refresh Token"
                                disabled={isConnected || isLoading}
                                value={refreshToken}
                                onChange={(e) => setRefreshToken(e.target.value)}
                                type="password"
                            />
                            <p className="text-xs text-muted-foreground">This token is used to generate temporary access tokens.</p>
                        </div>

                        {(isConnected || accessToken) && (
                            <div className="grid gap-2">
                                <Label htmlFor="accessToken">Access Token (Session)</Label>
                                <Input
                                    id="accessToken"
                                    readOnly
                                    disabled
                                    value={accessToken}
                                    className="font-mono text-xs bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">This token is automatically generated and used for API requests.</p>
                            </div>
                        )}

                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                {error}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        {!isConnected ? (
                            <Button onClick={handleSave} disabled={isLoading || !refreshToken}>
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
                                <p className="text-sm text-muted-foreground">Properties fetched from your Bed24 account.</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleSync} disabled={isLoading}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                Sync Now
                            </Button>
                        </div>

                        <Card>
                            {properties.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    No properties found in this Bed24 account.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="pl-6">ID</TableHead>
                                            <TableHead>Property Name</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead className="text-right pr-6">Owner ID</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {properties.map((property) => (
                                            <TableRow key={property.id}>
                                                <TableCell className="font-mono text-xs pl-6">{property.id}</TableCell>
                                                <TableCell className="font-medium">{property.name}</TableCell>
                                                <TableCell>
                                                    {property.city && property.country ? `${property.city}, ${property.country}` : 'N/A'}
                                                </TableCell>
                                                <TableCell className="capitalize">{property.propertyType || 'N/A'}</TableCell>
                                                <TableCell className="text-right text-muted-foreground pr-6">
                                                    {property.account?.ownerId || 'N/A'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
