"use client"

import { Todo as TodoModel } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useState } from "react";
import AddEditTodoDialog from "./addEditTodoDialog";

interface TodoProps {
  todo: TodoModel;
}

export default function Todo({ todo }: TodoProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const wasUpadated = todo.updatedAt > todo.createdAt;

  const createdUpdatedAtTimestamp = (
    wasUpadated ? todo.updatedAt : todo.createdAt
  ).toDateString();

  return (
    <>
      <Card className="cursor-pointer  transition-shadow hover:shadow-lg"
      onClick={() => setShowEditDialog(true)}
      >
        <CardHeader>
          <CardTitle>{todo.title}</CardTitle>
          <CardDescription>
            {createdUpdatedAtTimestamp}
            {wasUpadated && " (updated)"}
          </CardDescription>
          <CardContent>
            {/* Menampilkan Deskripsi */}
            <p className="my-5 whitespace-pre-line">{todo.content}</p>

            {/* Menampilkan Priority */}
            <p className="whitespace-pre-line">
              <strong>Prioritas:</strong> {todo.priority}
            </p>

            {/* Menampilkan Status */}
            <p className="whitespace-pre-line">
              <strong>Status:</strong>{" "}
              {todo.status === "COMPLETED" ? "Selesai ✅" : "Belum Selesai ❌"}
            </p>
          </CardContent>
        </CardHeader>
      </Card>
      <AddEditTodoDialog
        open={showEditDialog}
        setOpen={setShowEditDialog}
        todoToEdit={todo}
      />
    </>
  );
}
