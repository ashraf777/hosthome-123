
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Bell, Brush, CreditCard, Lock, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general"><SettingsIcon className="mr-2 h-4 w-4" />General</TabsTrigger>
          <TabsTrigger value="appearance"><Brush className="mr-2 h-4 w-4" />Appearance</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />Notifications</TabsTrigger>
          <TabsTrigger value="security"><Lock className="mr-2 h-4 w-4" />Security</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your system's general configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-2">
                <Label htmlFor="site-name">Property Management System Name</Label>
                <Input id="site-name" defaultValue="HostHome" />
                <p className="text-sm text-muted-foreground">This is the name that appears throughout the system.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select defaultValue="usd">
                  <SelectTrigger id="currency" className="w-[180px]">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="jpy">JPY (¥)</SelectItem>
                  </SelectContent>
                </Select>
                 <p className="text-sm text-muted-foreground">This will be the default currency for all financial data.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="utc-5">
                    <SelectTrigger className="w-full md:w-1/2">
                        <SelectValue placeholder="Select a timezone" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="utc-8">Pacific Time (UTC-08:00)</SelectItem>
                        <SelectItem value="utc-7">Mountain Time (UTC-07:00)</SelectItem>
                        <SelectItem value="utc-6">Central Time (UTC-06:00)</SelectItem>
                        <SelectItem value="utc-5">Eastern Time (UTC-05:00)</SelectItem>
                    </SelectContent>
                </Select>
              </div>
               <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label>Theme</Label>
                        <p className="text-sm text-muted-foreground">Select a light or dark theme for your dashboard.</p>
                    </div>
                     <Select defaultValue="system">
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label>New Booking</Label>
                        <p className="text-sm text-muted-foreground">Receive an email when a new booking is made.</p>
                    </div>
                    <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label>Booking Cancellation</Label>
                        <p className="text-sm text-muted-foreground">Receive an email when a booking is cancelled.</p>
                    </div>
                    <Switch defaultChecked />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label>Guest Message</Label>
                        <p className="text-sm text-muted-foreground">Receive an email when a guest sends a new message.</p>
                    </div>
                    <Switch />
                </div>
                 <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account's security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label>Two-Factor Authentication (2FA)</Label>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label>Login History</Label>
                        <p className="text-sm text-muted-foreground">View recent login activity on your account.</p>
                    </div>
                    <Button variant="outline">View History</Button>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
