import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createTicket,
  deleteTicket,
  updateTicket,
} from "../api/ticketMutations";

import type {
  CreateTicketInput,
  TicketsResponse,
  UpdateTicketInput,
} from "../types/ticket";

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticket: CreateTicketInput) =>
      createTicket(ticket),

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
      ticket: UpdateTicketInput;
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
    mutationFn: (id: string) => deleteTicket(id),

    onMutate: async (ticketId) => {
      await queryClient.cancelQueries({
        queryKey: ["tickets"],
      });

      const previousQueries =
        queryClient.getQueriesData<TicketsResponse>({
          queryKey: ["tickets"],
        });

      queryClient.setQueriesData<TicketsResponse>(
        {
          queryKey: ["tickets"],
        },
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          const deletedTicket = oldData.data.find(
            (ticket) => ticket.id === ticketId,
          );

          if (!deletedTicket) {
            return oldData;
          }

          const newStats = {
            ...oldData.stats,
            [deletedTicket.status]:
              oldData.stats[deletedTicket.status] - 1,
          };

          return {
            ...oldData,
            data: oldData.data.filter(
              (ticket) => ticket.id !== ticketId,
            ),
            pagination: {
              ...oldData.pagination,
              total: Math.max(
                0,
                oldData.pagination.total - 1,
              ),
              totalPages: Math.max(
                1,
                Math.ceil(
                  Math.max(
                    0,
                    oldData.pagination.total - 1,
                  ) / oldData.pagination.limit,
                ),
              ),
            },
            stats: newStats,
          };
        },
      );

      return {
        previousQueries,
      };
    },

    onError: (_error, _ticketId, context) => {
      if (!context) {
        return;
      }

      for (const [queryKey, data] of context.previousQueries) {
        queryClient.setQueryData(queryKey, data);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });
    },
  });
};