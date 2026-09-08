import type {
  Ticket,
  TicketsResponse,
} from "../types/ticket";

const API_URL = "/api";

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

const buildQueryString = (params: TicketQueryParams = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();

  return query ? `?${query}` : "";
};

const handleResponse = async <T>(
  response: Response,
): Promise<T> => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const getTickets = async (
  params: TicketQueryParams = {},
): Promise<TicketsResponse> => {
  const response = await fetch(
    `${API_URL}/tickets${buildQueryString(params)}`,
  );

  return handleResponse<TicketsResponse>(response);
};

export const getTicket = async (id: string): Promise<Ticket> => {
  const response = await fetch(`${API_URL}/tickets/${id}`);

  const result = await handleResponse<{
    success: true;
    data: Ticket;
  }>(response);

  return result.data;
};
