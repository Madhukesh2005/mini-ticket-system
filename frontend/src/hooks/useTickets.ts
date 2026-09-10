import { useQuery } from "@tanstack/react-query";
import { getTicket, getTickets } from "../api/tickets";
import type { TicketQueryParams } from "../api/tickets";
import type { Ticket } from "../types/ticket";

export const useTickets = (params: TicketQueryParams = {}) => {
  return useQuery({
    queryKey: ["tickets", params],
    queryFn: ({ signal }) => getTickets(params, signal),
  });
};

export const useTicket = (id: string, initialData?: Ticket) => {
  return useQuery({
    queryKey: ["ticket", id],
    queryFn: ({ signal }) => getTicket(id, signal),
    enabled: Boolean(id),
    initialData,
  });
};
