import prisma from "@/lib/db/prisma";
import { createTodoSchema, deleteTodoSchema, updateTodoSchema } from "@/lib/validation/todos";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parseResult = createTodoSchema.safeParse(body);

    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid Input" }, { status: 500 });
    }

    const { title, content, priority, status } = parseResult.data;

    const { userId } = await auth();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        content,
        priority,
        status,
        userId,
      },
    });

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

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: {
        title,
        content,
        priority,
        status,
      },
    });
    return Response.json({updatedTodo}, {status: 200})
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
      
      await prisma.todo.delete({ where: {id}})

      return Response.json({message: "Delete Success"}, {status: 200})
    } catch (error) {
      console.log(error);
      return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
  