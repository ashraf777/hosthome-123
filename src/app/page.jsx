import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirect to login by default if no company slug is provided
  redirect("/login");
}
