"use client";

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
    open: boolean;
}

export default function Todo({ todo }: TodoProps) {
    const [showEditDialog, setShowEditDialog] = useState(false);

    const wasUpdated = todo.updatedAt > todo.createdAt;
    const createdUpdatedAtTimestamp = (
        wasUpdated ? todo.updatedAt : todo.createdAt
    ).toDateString();

    return (
        <>
            <Card
                className="cursor-pointer transition-shadow hover:shadow-lg"
                onClick={() => setShowEditDialog(true)}
            >
                <CardHeader>
                    <CardTitle>{todo.title}</CardTitle>
                    <CardDescription>
                        {createdUpdatedAtTimestamp}
                        {wasUpdated && " (updated)"}
                    </CardDescription>
                <CardContent>
                {todo.content && 
                todo.content
                    .split("\n") // Split content into paragraphs by newline
                    .slice(0, 3) // Only take the first 2 paragraphs
                    .map((paragraph, index) => (
                        <p key={index} className="my-5 whitespace-pre-line">{paragraph}</p>
                    ))}
                    <p className="whitespace-pre-line">
                        <strong>Prioritas:</strong> {todo.priority}
                    </p>
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
