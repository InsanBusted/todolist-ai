import Image from "next/image";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";


export default async function Home() {
  const { userId } = await auth()

  if (userId) redirect("/todos")

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-4">
        <Image src={logo} alt="Todolist Logo" width={100} height={100} />
        <span className="font-extrabold tracking-tight lg:text-5xl">
          ToDolist
        </span>
      </div>
      <p className="max-w-prose text-center">
        An Intelligent Todolist App with AI integration, built with OpenAI,
        Pinecone, NextJs, ShadcnUI, Clerk, and more.
      </p>
      <Button size="lg" asChild>
        <Link href="/todos">Open</Link>
      </Button>
    </main>
  );
}
