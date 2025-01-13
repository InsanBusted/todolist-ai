import Todo from "@/components/Todo";
import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Todolist AI ",
};

export default async function TodosPage() {
  const { userId } = await auth();

  if (!userId) throw Error("userId Undefined");

  const allTodos = await prisma.todo.findMany({ where: { userId } });

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {allTodos.map((todo) => (
        <Todo todo={todo} key={todo.id} />
      ))}
      {allTodos.length === 0 && (
        <div className="col-span-full text-center">
            {"You Don't have any todolist yet. Why don't you create one?"}
        </div>
      )}
    </div>
  );
}
