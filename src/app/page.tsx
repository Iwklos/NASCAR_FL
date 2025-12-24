import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  try {
    const session = await auth();
    
    if (session) {
      redirect("/dashboard");
    } else {
      redirect("/login");
    }
  } catch (error) {
    console.error("Auth error:", error);
    // If auth fails (e.g., missing env vars), redirect to login
    redirect("/login");
  }
}
