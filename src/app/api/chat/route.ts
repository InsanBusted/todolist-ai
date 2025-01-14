import { todoIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import openai, { getEmbedding } from "@/lib/openai";
import { auth } from "@clerk/nextjs/server";
import { ChatCompletionMessage, ChatCompletionSystemMessageParam } from "openai/resources/index.mjs";
import { OpenAIStream, StreamingTextResponse } from 'ai';

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages: ChatCompletionMessage[] = body.messages

    const messagesTruncated = messages.slice(-6)
    
    const embedding = await getEmbedding(
        messagesTruncated.map((message) => message.content).join("\n")
    )

    const {userId} = await auth()

    const vectorQueryResponse = await todoIndex.query({
        vector: embedding,
        topK: 6,
        filter: {userId}
    })

    const relevantTodos = await prisma.todo.findMany({
        where: {
            id: {
                in: vectorQueryResponse.matches.map((match) => match.id)
            }
        }
    })

    // console.log("Relevant Notes not Found: ", relevantTodos)

    const systemMessage: ChatCompletionMessage = {
        role: "assistant",
        content: 
    "You are an intelligent Todolist app. You answer the user's question based on their existing todos.\n" + 
    "The relevant todos for this query are:\n" +
    relevantTodos.map((todo) => 
        `${todo.title}: ${todo.content}\nPriority: ${todo.priority}\nStatus: ${todo.status}`
    ).join("\n\n"),
        refusal: ""
    }
    const aiMessage: ChatCompletionSystemMessageParam = {
        role: "system",
        content: "Do not user markdown formatting, * or #",
    };

    const message = [systemMessage, aiMessage, ...messagesTruncated];

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        stream: true,
        messages: message
    })

    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)

  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}