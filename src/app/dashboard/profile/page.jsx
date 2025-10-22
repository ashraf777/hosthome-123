
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="text-primary" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal details and profile picture.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
            <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                    <AvatarImage src="https://picsum.photos/seed/hosthome-user/100/100" alt="Admin User" data-ai-hint="person face" />
                    <AvatarFallback>AU</AvatarFallback>
                </Avatar>
                <div className="grid gap-2">
                    <Label htmlFor="picture">Profile Picture</Label>
                    <Input id="picture" type="file" />
                     <p className="text-xs text-muted-foreground">PNG, JPG, or GIF up to 5MB.</p>
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue="Admin User" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="admin@hosthome.com" disabled />
                </div>
            </div>
             <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder="Tell us a little about yourself" defaultValue="I am the administrator for HostHome, managing the property listings and ensuring a great experience for our guests."/>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                 <div className="grid gap-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                </div>
            </div>
            <div>
                 <Button>Update Profile</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
