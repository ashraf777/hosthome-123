import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

export default function GuestMessagingPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Automated Messaging</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="text-primary" />
            Coming Soon!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Our Automated Guest Messaging tool will help you provide 5-star service without lifting a finger.
          </p>
          <p className="mt-4 text-muted-foreground">
            Set up automated messages for pre-stay reminders, check-in instructions, mid-stay check-ups, and post-stay thank you notes. Enhance guest experience and secure those great reviews, effortlessly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
