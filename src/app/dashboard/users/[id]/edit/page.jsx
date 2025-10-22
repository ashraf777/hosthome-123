import Link from "next/link";
import { UserForm } from "../../user-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditUserPage({ params }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/users" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
          <p className="text-muted-foreground">Editing role for user ID: {params.id}</p>
        </div>
      </div>
      <UserForm isEditMode userId={params.id} />
    </div>
  )
}
