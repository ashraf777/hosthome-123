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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { api } from "@/services/api"
import { useToast } from "@/hooks/use-toast"

export default function Bed24ConnectPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [refreshToken, setRefreshToken] = useState("");
    const [accessToken, setAccessToken] = useState(""); // Kept for UI stability but hides actual token
    const [properties, setProperties] = useState([]);
    const [error, setError] = useState("");
    const { toast } = useToast();

    // Modals State
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [attachModalOpen, setAttachModalOpen] = useState(false);
    const [selectedBeds24Id, setSelectedBeds24Id] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Dropdown Data
    const [hostingCompanies, setHostingCompanies] = useState([]);
    const [propertyOwners, setPropertyOwners] = useState([]);
    const [localProperties, setLocalProperties] = useState([]);

    // Form State
    const [selectedCompanyId, setSelectedCompanyId] = useState("");
    const [selectedOwnerId, setSelectedOwnerId] = useState("");
    const [selectedLocalPropertyId, setSelectedLocalPropertyId] = useState("");

    // Check backend connection status on mount
    React.useEffect(() => {
        const checkStatus = async () => {
            try {
                // Determine if we have a permanently stored invite key on the Laravel backend
                const response = await api.get('beds24/status');
                if (response.is_connected) {
                    setIsConnected(true);
                    setAccessToken("Managed securely by server");
                    fetchProperties();
                }
            } catch (err) {
                console.error("Failed to check Beds24 status", err);
            }
        };

        checkStatus();
    }, []);

    const fetchProperties = async () => {
        setIsLoading(true);
        setError("");
        try {
            // The Laravel backend handles injecting the rotating token automatically
            const response = await api.get('beds24/properties');

            if (response.success === false) {
                throw new Error(response.error || "API reported failure when fetching properties.");
            }

            // Beds24 returns an object with a `data` array in standard v2 properties output or a direct array
            const fetchedProperties = response.data || response || [];

            // Note: If standard response object isn't an array but has no 'success' flag, we check length
            if (Array.isArray(response)) {
                setProperties(response);
            } else if (Array.isArray(fetchedProperties)) {
                setProperties(fetchedProperties);
            } else {
                setProperties([]);
            }

            return true;
        } catch (err) {
            console.error(err);
            setError(err.message || "An unexpected error occurred during property fetch.");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError("");
        try {
            // Send the Invite/Refresh Token directly to Laravel to test and persist
            const response = await api.post('beds24/config', {
                invite_key: refreshToken
            });

            if (!response.success) {
                throw new Error(response.error || "Failed to authenticate. Please check your Refresh Token.");
            }

            setIsConnected(true);
            setAccessToken("Managed securely by server");

            // Automatically sync the first batch of properties using the brand new connection
            await fetchProperties();

        } catch (err) {
            console.error(err);
            setError(err.message || "An unexpected error occurred.");
            setIsLoading(false);
        }
    };

    const handleReconfigure = () => {
        setIsConnected(false);
        setAccessToken("");
        setProperties([]);
        setRefreshToken("");
        // Optional: you could hit a delete config route here if needed, 
        // but allowing overwrite on save is usually sufficient
    };

    const handleSync = async () => {
        await fetchProperties();
    };

    // Modal Triggers
    const openImportModal = async (beds24Id) => {
        setSelectedBeds24Id(beds24Id);
        setImportModalOpen(true);
        setIsActionLoading(true);
        try {
            const [companiesRes, ownersRes] = await Promise.all([
                api.get('hosting-companies'),
                api.get('property-owners')
            ]);
            setHostingCompanies(companiesRes.data || []);
            setPropertyOwners(ownersRes.data || []);
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Failed to load companies or owners." });
        } finally {
            setIsActionLoading(false);
        }
    };

    const openAttachModal = async (beds24Id) => {
        setSelectedBeds24Id(beds24Id);
        setAttachModalOpen(true);
        setIsActionLoading(true);
        try {
            const localRes = await api.get('properties');
            setLocalProperties(localRes.data || []);
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Failed to load local properties." });
        } finally {
            setIsActionLoading(false);
        }
    };

    // Action Submissions
    const handleImportSubmit = async () => {
        if (!selectedCompanyId || !selectedOwnerId) {
            toast({ variant: "destructive", title: "Required", description: "Please select both a Company and an Owner." });
            return;
        }

        setIsActionLoading(true);
        try {
            await api.post('beds24/properties/import', {
                beds24_property_id: selectedBeds24Id,
                hosting_company_id: selectedCompanyId,
                property_owner_id: selectedOwnerId
            });
            toast({ title: "Success", description: "Property imported successfully as a new Local Listing." });
            setImportModalOpen(false);

            // Instantly refresh the properties list to trigger the 'Imported' green badge
            await fetchProperties();
        } catch (err) {
            toast({ variant: "destructive", title: "Import Failed", description: err.message });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleAttachSubmit = async () => {
        if (!selectedLocalPropertyId) {
            toast({ variant: "destructive", title: "Required", description: "Please select a local property to attach." });
            return;
        }

        setIsActionLoading(true);
        try {
            await api.post('beds24/properties/attach', {
                beds24_property_id: selectedBeds24Id,
                local_property_id: selectedLocalPropertyId
            });
            toast({ title: "Success", description: "Beds24 Property mapped to existing Local Listing." });
            setAttachModalOpen(false);

            // Instantly refresh the properties list to trigger the 'Imported' green badge
            await fetchProperties();
        } catch (err) {
            toast({ variant: "destructive", title: "Attach Failed", description: err.message });
        } finally {
            setIsActionLoading(false);
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
                                            <TableHead className="text-right">Owner ID</TableHead>
                                            <TableHead className="text-right pr-6">Actions</TableHead>
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
                                                <TableCell className="text-right text-muted-foreground">
                                                    {property.account?.ownerId || 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    {property.is_imported ? (
                                                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-none">
                                                            <CheckCircle2 className="mr-1 h-3 w-3 inline" />
                                                            Imported
                                                        </Badge>
                                                    ) : (
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="outline" size="sm" onClick={() => openImportModal(property.id)}>
                                                                Import as New
                                                            </Button>
                                                            <Button variant="secondary" size="sm" onClick={() => openAttachModal(property.id)}>
                                                                Attach
                                                            </Button>
                                                        </div>
                                                    )}
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

            {/* Import as New Modal */}
            <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Beds24 Property as New</DialogTitle>
                        <DialogDescription>
                            Select the Hosting Company and Property Owner this new listing will belong to.
                        </DialogDescription>
                    </DialogHeader>
                    {isActionLoading && (!hostingCompanies.length || !propertyOwners.length) ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Hosting Company</Label>
                                <Select onValueChange={setSelectedCompanyId} value={selectedCompanyId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Company" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {hostingCompanies.map(company => (
                                            <SelectItem key={company.id} value={company.id.toString()}>{company.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Property Owner</Label>
                                <Select onValueChange={setSelectedOwnerId} value={selectedOwnerId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Owner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {propertyOwners.map(owner => (
                                            <SelectItem key={owner.id} value={owner.id.toString()}>{owner.full_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setImportModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleImportSubmit} disabled={isActionLoading}>
                            {isActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Import Listing"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Attach Modal */}
            <Dialog open={attachModalOpen} onOpenChange={setAttachModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Attach to Existing Local Property</DialogTitle>
                        <DialogDescription>
                            Select an existing HostHome property to map the Beds24 rooms and calendar to.
                        </DialogDescription>
                    </DialogHeader>
                    {isActionLoading && !localProperties.length ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Local Property</Label>
                                <Select onValueChange={setSelectedLocalPropertyId} value={selectedLocalPropertyId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select local property" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {localProperties.map(prop => (
                                            <SelectItem key={prop.id} value={prop.id.toString()}>{prop.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAttachModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAttachSubmit} disabled={isActionLoading}>
                            {isActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Attach to Property"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
