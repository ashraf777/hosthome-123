import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function ChannelSyncPage() {
  const channels = [
    "Airbnb",
    "Booking.com",
    "Agoda",
    "Expedia",
    "Google Vacation Rentals",
  ]
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Channel Sync</h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Channel Connections</CardTitle>
          <CardDescription>
            Connect and sync your property listings across various channels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {channels.map((channel) => (
              <div key={channel}>
                <div className="flex items-center justify-between">
                  <Label htmlFor={`channel-${channel}`} className="text-lg">
                    {channel}
                  </Label>
                  <Button variant="outline">Connect</Button>
                </div>
                <Separator className="mt-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
