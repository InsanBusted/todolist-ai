import { todoIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import openai, { getEmbedding } from "@/lib/openai";
import { auth } from "@clerk/nextjs/server";
import {
  ChatCompletionMessage,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from "openai/resources/index.mjs";
import { OpenAIStream, StreamingTextResponse } from "ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatCompletionMessage[] = body.messages;

    const messagesTruncated = messages.slice(-6);

    const embedding = await getEmbedding(
      messagesTruncated.map((message) => message.content).join("\n"),
    );

    const { userId } = await auth();

    const vectorQueryResponse = await todoIndex.query({
      vector: embedding,
      topK: 6,
      filter: { userId },
    });

    const relevantTodos = await prisma.todo.findMany({
      where: {
        id: {
          in: vectorQueryResponse.matches.map((match) => match.id),
        },
      },
    });

    const systemMessage: ChatCompletionMessage = {
      role: "assistant",
      content:
        `You are an intelligent Todolist app. You answer the user's question based on their existing todos.\n` +
        `If the user requests a list or step-by-step instructions, provide them using numbered points.` +
        `The relevant todos for this query are:\n` +
        relevantTodos
          .map(
            (todo) =>
              `${todo.title}: ${todo.content}\nPriority: ${todo.priority}\nStatus: ${todo.status}`,
          )
          .join("\n\n"),
      refusal:
        "I'm sorry, but I can only answer questions based on the provided relevant todos.",
    };

    const aiMessage: ChatCompletionSystemMessageParam = {
      role: "system",
      content:
        `Do not use markdown formatting, * or #.` +
        `Only respond based on the relevant todos.` +
        ` Dont answer if user ask outside todos` +
        `If the user requests a list or step-by-step instructions, provide them using numbered points.` +
        `The relevant todos for this query are:\n` +
        relevantTodos
          .map(
            (todo) =>
              `${todo.title}: ${todo.content}\nPriority: ${todo.priority}\nStatus: ${todo.status}`,
          )
          .join("\n\n"),
          
    };

    const userMessages: ChatCompletionUserMessageParam[] = [
        { role: "user", content: "What tasks are still incomplete?" },
        { role: "user", content: "Which tasks have the highest priority?" },
        { role: "user", content: "Can you list the tasks that are already completed?" },
        { role: "user", content: "Summarize all tasks with low priority." },
        { role: "user", content: "What tasks should be completed today?" },
        { role: "user", content: "Show me the incomplete tasks sorted by priority." },
        { role: "user", content: "What tasks are due this week?" },
        { role: "user", content: "Can you list all tasks categorized by priority level?" },
        { role: "user", content: "Which tasks are marked as urgent?" },
        { role: "user", content: "What tasks are currently in progress?" },
        { role: "user", content: "How many tasks are pending completion?" },
        { role: "user", content: "List all tasks created recently." },
        { role: "user", content: "Which tasks were completed last week?" },
        { role: "user", content: "What are my next steps for completing the 'Learn React' task?" },
        { role: "user", content: "Are there any tasks marked as critical?" },
        { role: "user", content: "Can you show me tasks assigned for the weekend?" },
        { role: "user", content: "Which tasks are marked as low priority but still pending?" },
        { role: "user", content: "Show me tasks related to 'Project X' only." },
        { role: "user", content: "How many tasks have a deadline this month?" },
        { role: "user", content: "List all tasks that are overdue." }
    ];

    const message = [
      systemMessage,
      aiMessage,
      ...userMessages,
      ...messagesTruncated,
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      stream: true,
      messages: message,
      temperature: 0.7,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
