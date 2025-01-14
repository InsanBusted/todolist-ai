"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import Todo from "./Todo";
import { Todo as TodoModel } from "@prisma/client";

interface HighButtonProps {
    todos: TodoModel[];
}

export default function HighButton({ todos }: HighButtonProps) {
    const [showCompleted, setShowCompleted] = useState(false);

    const higPriority = todos.filter((todo) => todo.priority === "HIGH");

    return (
        <>
            <Button className="mt-5 mb-4" onClick={() => setShowCompleted((prev) => !prev)}>
                {showCompleted ? "Hide High Priority Todos" : "Show High Priority Todos"}
            </Button>
            {showCompleted && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4 mb-4">
                    {higPriority.map((todo) => (
                        <Todo key={todo.id} todo={todo} open={true} />
                    ))}
                    {higPriority.length === 0 && (
                        <p className="text-center col-span-full">
                            No High Priority todos yet!
                        </p>
                    )}
                </div>
            )}
        </>
    );
}
