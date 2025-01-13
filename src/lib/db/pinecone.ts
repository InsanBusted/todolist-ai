import { Pinecone } from "@pinecone-database/pinecone";

const apiKey = process.env.PINECONE_API_KEY

if(!apiKey) {
    throw Error("PINECONE API KEY IS NOT SET")
}

const pinecone = new Pinecone({
    apiKey: apiKey
})

export const todoIndex = pinecone.Index("todolist-ai")