"use client";
import Link from "next/link";
import logo from "@/assets/logo.png";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddEditTodoDialog from "@/components/addEditTodoDialog"; // Import the properly capitalized component
import ThemeToggleButton from "@/components/ThemeToggleButton";
import {dark} from "@clerk/themes"
import { useTheme } from "next-themes";
import AIChatButton from "@/components/AIChatButton";

export default function Navbar() {
  const {theme} = useTheme()

  const [showAddEditTodoDialog, setShowAddEditTodoDialog] = useState(false);

  return (
    <>
      <div className="p-4 shadow">
        <div className="m-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <Link href="/todos" className="flex items-center gap-1">
            <Image src={logo} alt="Todolist Logo" width={40} height={40} />
            <span className="font-bold">Todolist</span>
          </Link>
          <div className="flex items-center gap-2">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                baseTheme: (theme === "dark" ? dark : undefined),
                elements: { avatarBox: { width: "2.5rem", height: "2.5rem" } },
              }}
            />
            <ThemeToggleButton/>
            <Button onClick={() => setShowAddEditTodoDialog(true)}>
              <Plus size={20} className="mr-2" />
              Create Todolist
            </Button>
            <AIChatButton></AIChatButton>
          </div>
        </div>
      </div>
      <AddEditTodoDialog open={showAddEditTodoDialog} setOpen={setShowAddEditTodoDialog} /> {/* Use the capitalized component */}
    </>
  );
}
