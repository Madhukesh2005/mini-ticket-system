import type {
  CreateTicketInput,
  Ticket,
  UpdateTicketInput,
} from "../types/ticket";

import { handleResponse } from "./client";

const API_URL =
  import.meta.env.VITE_API_URL || "/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const createTicket = async (
  ticket: CreateTicketInput,
): Promise<Ticket> => {
  const response = await fetch(
    `${API_URL}/tickets`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ticket),
    },
  );

  const result = await handleResponse<
    ApiResponse<Ticket>
  >(response);

  return result.data;
};

export const updateTicket = async (
  id: string,
  ticket: UpdateTicketInput,
): Promise<Ticket> => {
  const response = await fetch(
    `${API_URL}/tickets/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ticket),
    },
  );

  const result = await handleResponse<
    ApiResponse<Ticket>
  >(response);

  return result.data;
};

export const deleteTicket = async (
  id: string,
): Promise<void> => {
  const response = await fetch(
    `${API_URL}/tickets/${id}`,
    {
      method: "DELETE",
    },
  );

  await handleResponse<void>(response);
};