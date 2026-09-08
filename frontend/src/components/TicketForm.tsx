import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCreateTicket } from "../hooks/useTicketMutations";

const ticketFormSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Customer name must be at least 2 characters"),

  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters"),

  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters"),

  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

interface TicketFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TicketForm({
  onSuccess,
  onCancel,
}: TicketFormProps) {
  const createTicketMutation = useCreateTicket();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      customerName: "",
      title: "",
      description: "",
      priority: "MEDIUM",
    },
  });

  const onSubmit = (data: TicketFormValues) => {
    createTicketMutation.mutate(data, {
      onSuccess: () => {
        reset();
        onSuccess?.();
      },
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-200 p-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Create Ticket
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Add a new customer support ticket.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close create ticket form"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6"
      >
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Customer Name
            </label>

            <input
              {...register("customerName")}
              placeholder="John Doe"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-500"
            />

            {errors.customerName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.customerName.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Title
            </label>

            <input
              {...register("title")}
              placeholder="Unable to login"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-500"
            />

            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              {...register("description")}
              placeholder="Describe the problem..."
              rows={5}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-500"
            />

            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Priority
            </label>

            <select
              {...register("priority")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>

            {errors.priority && (
              <p className="mt-1 text-sm text-red-600">
                {errors.priority.message}
              </p>
            )}
          </div>
        </div>

        {createTicketMutation.isError && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {createTicketMutation.error instanceof Error
              ? createTicketMutation.error.message
              : "Failed to create ticket."}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={createTicketMutation.isPending}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createTicketMutation.isPending
              ? "Creating..."
              : "Create Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}