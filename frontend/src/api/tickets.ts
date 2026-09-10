import type {
  Ticket,
  TicketsResponse,
} from "../types/ticket";

export {
  ApiError,
  extractErrorMessage,
  handleResponse,
} from "./client";

import { handleResponse } from "./client";

const API_URL =
  import.meta.env.VITE_API_URL || "/api";

export interface TicketQueryParams {
  status?: string;
  priority?: string;
  customer?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

const buildQueryString = (
  params: TicketQueryParams = {},
) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();

  return query ? `?${query}` : "";
};

export const getTickets = async (
  params: TicketQueryParams = {},
  signal?: AbortSignal,
): Promise<TicketsResponse> => {
  const response = await fetch(
    `${API_URL}/tickets${buildQueryString(params)}`,
    { signal },
  );

  return handleResponse<TicketsResponse>(response);
};

export const getTicket = async (
  id: string,
  signal?: AbortSignal,
): Promise<Ticket> => {
  const response = await fetch(
    `${API_URL}/tickets/${id}`,
    { signal },
  );

  const result = await handleResponse<{
    success: true;
    data: Ticket;
  }>(response);

  return result.data;
};