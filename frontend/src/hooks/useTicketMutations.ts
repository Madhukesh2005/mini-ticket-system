import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createTicket,
  deleteTicket,
  updateTicket,
} from "../api/ticketMutations";

import type { Ticket } from "../types/ticket";

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTicket,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ticket,
    }: {
      id: string;
      ticket: Partial<Ticket>;
    }) => updateTicket(id, ticket),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });

      queryClient.invalidateQueries({
        queryKey: ["ticket", variables.id],
      });
    },
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTicket,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });
    },
  });
};
