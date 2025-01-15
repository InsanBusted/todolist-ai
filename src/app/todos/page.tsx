import CompleteButton from "@/components/CompleteButton";
import Todo from "@/components/Todo";
import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import {  Todo as TodoModel } from "@prisma/client";
import HighButton from "@/components/HighButton";

export const metadata: Metadata = {
  title: "Todolist AI",
};

export default async function TodosPage() {
  const { userId } = await auth();

  if (!userId) throw new Error("User ID is undefined");

  // Mengambil semua data todo dari database dengan Prisma
  const allTodos: TodoModel[] = await prisma.todo.findMany({
    where: { userId },
  });
  const CompletedTodos: TodoModel[] = await prisma.todo.findMany({
    where: { 
      userId,  // Jika ingin memfilter hanya yang COMPLETED
  }
});

  return (
    <main>
      <h1 className="font-serif text-3xl mb-4">My Todolist</h1>
      {/* ALL TODOLIST */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-4">
        {allTodos.map((todo) => (
          <Todo todo={todo} key={todo.id} open={false} />
        ))}

        {allTodos.length === 0 && (
          <div className="col-span-full text-center text-gray-500">
            {"You don't have any todolist yet. Why don't you create one?"}
          </div>
        )}
         {/* Memanggil CompleteButton dengan mengirimkan data todos */}
      </div>
      <h1 className="font-serif text-3xl mt-4 mb-4">Filter Todolist</h1>
      <CompleteButton todos={CompletedTodos} />
      <HighButton todos={allTodos} />
    </main>
  );
}
