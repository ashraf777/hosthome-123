import Link from "next/link";
import { UserForm } from "../user-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewUserPage() {
  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center gap-4">
        <Link href="/dashboard/users" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New User</h1>
            <p className="text-muted-foreground">Add a new user to the system.</p>
        </div>
      </div>
      <UserForm isEditMode={false} />
    </div>
  )
}
