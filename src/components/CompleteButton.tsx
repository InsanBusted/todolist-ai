"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import Todo from "./Todo";
import { Todo as TodoModel } from "@prisma/client";

interface CompleteButtonProps {
    todos: TodoModel[];
}

export default function CompleteButton({ todos }: CompleteButtonProps) {
    const [showCompleted, setShowCompleted] = useState(false);

    const completedTodos = todos.filter((todo) => todo.status === "COMPLETED");

    return (
        <>
            <Button className="mx-3 my-3 mb-4" onClick={() => setShowCompleted((prev) => !prev)}>
                {showCompleted ? "Hide Completed Todos" : "Show Completed Todos"}
            </Button>

            {showCompleted && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4 mb-4">
                    {completedTodos.length > 0 ? (
                        completedTodos.map((todo) => (
                            <Todo key={todo.id} todo={todo} open={true} />
                        ))
                    ) : (
                        <p className="text-center col-span-full">
                            No completed todos yet!
                        </p>
                    )}
                </div>
            )}
        </>
    );
}
