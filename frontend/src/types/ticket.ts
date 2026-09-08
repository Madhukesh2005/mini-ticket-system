export type Priority = "LOW" | "MEDIUM" | "HIGH";

export type Status =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export interface Ticket {
  id: string;
  customerName: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface TicketPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TicketStats {
  OPEN: number;
  IN_PROGRESS: number;
  RESOLVED: number;
  CLOSED: number;
}

export interface TicketsResponse {
  success: true;
  data: Ticket[];
  pagination: TicketPagination;
  stats: TicketStats;
}

export interface CreateTicketInput {
  customerName: string;
  title: string;
  description: string;
  priority: Priority;
  status?: Status;
}

export interface UpdateTicketInput {
  customerName?: string;
  title?: string;
  description?: string;
  priority?: Priority;
  status?: Status;
}