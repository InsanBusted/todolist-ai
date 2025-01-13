import { z } from "zod";

const PriorityEnum = z.enum(["HIGH", "MEDIUM", "LOW"]);
const StatusEnum = z.enum(["COMPLETED", "INCOMPLETED"]);

export const createTodoSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().optional(), // Content bersifat opsional
  priority: PriorityEnum, // Validasi priority dengan enum
  status: StatusEnum,
});

export type CreateTodoSchema = z.infer<typeof createTodoSchema>

export const updateTodoSchema = createTodoSchema.extend({
    id: z.string().min(1)
})

export const deleteTodoSchema = z.object({
    id: z.string().min(1)
})