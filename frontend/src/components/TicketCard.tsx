import type { Ticket } from "../types/ticket";

interface TicketCardProps {
  ticket: Ticket;
  onSelect: (ticket: Ticket) => void;
}

const priorityStyles = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-red-100 text-red-700",
};

const statusStyles = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-200 text-gray-700",
};

const statusLabels = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export default function TicketCard({
  ticket,
  onSelect,
}: TicketCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(ticket)}
      className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">
            {ticket.customerName}
          </p>

          <h3 className="mt-1 text-lg font-semibold text-gray-900">
            {ticket.title}
          </h3>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${priorityStyles[ticket.priority]}`}
        >
          {ticket.priority}
        </span>
      </div>

      <p className="mb-4 line-clamp-2 text-sm text-gray-600">
        {ticket.description}
      </p>

      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[ticket.status]}`}
        >
          {statusLabels[ticket.status]}
        </span>

        <span className="text-xs text-gray-400">
          {new Date(ticket.createdAt).toLocaleDateString()}
        </span>
      </div>
    </button>
  );
}
