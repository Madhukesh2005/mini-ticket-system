import { useQuery } from "@tanstack/react-query";
import { getTickets } from "../api/tickets";
import type { TicketQueryParams } from "../api/tickets";

export const useTickets = (params: TicketQueryParams = {}) => {
  return useQuery({
    queryKey: ["tickets", params],
    queryFn: () => getTickets(params),
  });
};
