import Link from "next/link";
import { UserForm } from "../../user-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditUserPage({ params }: { params: { id: string } }) {
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
          <p className="text-muted-foreground">Editing user with ID: {params.id}</p>
        </div>
      </div>
      {/* 
        In a real application, you would fetch the user data using the id
        and pass it as a prop to the UserForm.
        e.g. <UserForm initialData={userData} isEditMode />
      */}
      <UserForm isEditMode />
    </div>
  )
}
