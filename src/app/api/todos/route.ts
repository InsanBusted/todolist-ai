import { todoIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import { getEmbedding } from "@/lib/openai";
import {
  createTodoSchema,
  deleteTodoSchema,
  updateTodoSchema,
} from "@/lib/validation/todos";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parseResult = createTodoSchema.safeParse(body);

    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid Input" }, { status: 400 });
    }

    const { title, content, priority, status } = parseResult.data;

    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mendapatkan embedding untuk todo
    const embedding = await getEmbeddingForTodo(
      title,
      content,
      priority,
      status,
    );

    // Gunakan transaksi Prisma
    const todo = await prisma.$transaction(async (tx) => {
      try {
        const todo = await tx.todo.create({
          data: {
            title,
            content,
            priority,
            status,
            userId,
          },
        });

        const records = [
          {
            id: todo.id,
            values: embedding,
            metadata: { userId },
          },
        ];

        await todoIndex.upsert(records);
        // console.log("Todo created:", todo);

        return todo;
      } catch (err) {
        console.error("Transaction error:", err);
        throw new Error("Transaction failed");
      }
    });

    // Mengembalikan hasil
    return Response.json({ todo }, { status: 201 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const parseResult = updateTodoSchema.safeParse(body);

    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid Input" }, { status: 500 });
    }

    const { id, title, content, priority, status } = parseResult.data;

    const todo = await prisma.todo.findUnique({ where: { id } });

    if (!todo) {
      return Response.json({ error: "Todo Not Found" }, { status: 404 });
    }

    const { userId } = await auth();

    if (!userId || userId !== todo.userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const embedding = await getEmbeddingForTodo(
      title,
      content,
      priority,
      status,
    );

    const updatedTodo = await prisma.$transaction(async (tx) => {
      try {
        const updatedTodo = await tx.todo.update({
          where: { id },
          data: {
            title,
            content,
            priority,
            status,
          },
        });

        await todoIndex.upsert([
          {
            id,
            values: embedding,
            metadata: { userId },
          },
        ]);

        return Response.json({ updatedTodo }, { status: 200 });
      } catch (error) {
        console.log(error);
        return Response.json(
          { error: "Internal Server Error" },
          { status: 500 },
        );
      }
    });
    return Response.json({ updatedTodo }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const parseResult = deleteTodoSchema.safeParse(body);

    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid Input" }, { status: 500 });
    }

    const { id } = parseResult.data;

    const todo = await prisma.todo.findUnique({ where: { id } });

    if (!todo) {
      return Response.json({ error: "Todo Not Found" }, { status: 404 });
    }

    const { userId } = await auth();

    if (!userId || userId !== todo.userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.todo.delete({where: {id}})
      await todoIndex.deleteOne(id)
    })
    return Response.json({ message: "Delete Success" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function getEmbeddingForTodo(
  title: string,
  content: string | undefined,
  priority: "HIGH" | "MEDIUM" | "LOW",
  status: "COMPLETED" | "INCOMPLETED",
) {
  return getEmbedding(
    title + "\n\n" + (content ?? "") + "\n\n" + priority + "\n\n" + status,
  );
}
