import { CreateTodoSchema, createTodoSchema } from "@/lib/validation/todos";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useRouter } from "next/navigation";
import { Todo } from "@prisma/client";
import { useState } from "react";
import LoadingButton from "./ui/loading-button";

interface AddEditTodoDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  todoToEdit?: Todo;
}

const priorityOptions = ["HIGH", "MEDIUM", "LOW"] as const;
const statusOptions = ["COMPLETED", "INCOMPLETED"] as const;

export default function AddEditTodoDialog({ open, setOpen, todoToEdit }: AddEditTodoDialogProps) {
  const [deleteInProgress, setDeleteInProgress] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const router = useRouter();

  const form = useForm<CreateTodoSchema>({
    resolver: zodResolver(createTodoSchema),
    defaultValues: {
      title: todoToEdit?.title || "",
      content: todoToEdit?.content || "",
      priority: todoToEdit?.priority || "LOW",
      status: todoToEdit?.status || "COMPLETED",
    },
  });

  async function onSubmit(input: CreateTodoSchema) {
    try {
      if(todoToEdit) {
        const response = await fetch("api/todos", {
          method: "PUT",
          body: JSON.stringify({
            id: todoToEdit.id,
            ...input
          })
        })
        if (!response.ok) throw Error("Status code: " + response.status);
      } else {
        const response = await fetch("/api/todos", {
          method: "POST",
          body: JSON.stringify(input),
        });
  
        if (!response.ok) throw Error("Status code: " + response.status);
        form.reset();
      }

      router.refresh();
      setOpen(false)
    } catch (error) {
      console.error(error);
      alert("Something went wrong, Please try again.");
    }
  }

  async function deleteTodo()  {
    if(!todoToEdit) return
    setDeleteInProgress(true)
    try {
      const response = await fetch("/api/todos", {
        method: "DELETE",
        body: JSON.stringify({
          id: todoToEdit.id
        })
      })
      if (!response.ok) throw Error("Status code: " + response.status);
      router.refresh();
      setOpen(false)
    } catch (error) {
      console.error(error);
      alert("Something went wrong, Please try again.");
    } finally {
      setDeleteInProgress(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{todoToEdit ? "Edit TodoList" : "Add TodoList"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan Judul" {...field}></Input>
                    </FormControl>
                    <FormMessage></FormMessage>
                  </FormItem>
                )}
              />

              {/* Input Content */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Masukkan Deskripsi"
                        {...field}
                        rows={4} // Menambahkan tinggi awal textarea
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Select Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioritas</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Prioritas" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Select Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <DialogFooter className="gap-1 sm:gap-0">
                {todoToEdit && (
                  <LoadingButton
                  variant="destructive"
                  loading={deleteInProgress}
                  disabled={form.formState.isSubmitting}
                  onClick={() => setShowDeleteConfirm(true)}
                  type="button"
                  >
                    Delete Note
                  </LoadingButton>
                )}
                <LoadingButton
                type="submit"
                loading={form.formState.isSubmitting}
                disabled={deleteInProgress}
                >
                  Submit
                </LoadingButton>
            </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Modal Konfirmasi Hapus */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <p>Are u Sure for delete this?</p>
            <DialogFooter>
              <LoadingButton variant="outline" loading={false} onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </LoadingButton>
              <LoadingButton variant="destructive" loading={deleteInProgress} onClick={deleteTodo}>
                Delete
              </LoadingButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>

    
  );
}
