import type { Priority, Status } from "../types/ticket";

interface TicketFiltersProps {
  search: string;
  status: Status | "";
  priority: Priority | "";
  customer: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: Status | "") => void;
  onPriorityChange: (value: Priority | "") => void;
  onCustomerChange: (value: string) => void;
  onClear: () => void;
}

export default function TicketFilters({
  search,
  status,
  priority,
  customer,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onCustomerChange,
  onClear,
}: TicketFiltersProps) {
  const hasFilters =
    search !== "" ||
    status !== "" ||
    priority !== "" ||
    customer !== "";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-4">
        <input
          type="text"
          placeholder="Search title or customer..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
        />

        <select
          value={status}
          onChange={(e) =>
            onStatusChange(e.target.value as Status | "")
          }
          className="rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>

        <select
          value={priority}
          onChange={(e) =>
            onPriorityChange(e.target.value as Priority | "")
          }
          className="rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="">All priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <input
          type="text"
          placeholder="Customer name..."
          value={customer}
          onChange={(e) => onCustomerChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
        />
      </div>

      {hasFilters && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}