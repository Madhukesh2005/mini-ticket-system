import type { Priority, Status } from "../types/ticket";

export type SortField =
  | "createdAt"
  | "updatedAt"
  | "title"
  | "customerName"
  | "priority";

export type SortOrder = "asc" | "desc";

interface TicketFiltersProps {
  search: string;
  status: Status | "";
  priority: Priority | "";
  customer: string;
  sortBy: SortField;
  order: SortOrder;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: Status | "") => void;
  onPriorityChange: (value: Priority | "") => void;
  onCustomerChange: (value: string) => void;
  onSortByChange: (value: SortField) => void;
  onOrderChange: (value: SortOrder) => void;
  onClear: () => void;
}

export default function TicketFilters({
  search,
  status,
  priority,
  customer,
  sortBy,
  order,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onCustomerChange,
  onSortByChange,
  onOrderChange,
  onClear,
}: TicketFiltersProps) {
  const hasFilters =
    search !== "" ||
    status !== "" ||
    priority !== "" ||
    customer !== "";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <input
          type="text"
          placeholder="Search title or customer..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 lg:col-span-2"
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

        <select
          value={sortBy}
          onChange={(e) =>
            onSortByChange(e.target.value as SortField)
          }
          className="rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="createdAt">Sort: Created</option>
          <option value="updatedAt">Sort: Updated</option>
          <option value="title">Sort: Title</option>
          <option value="customerName">Sort: Customer</option>
          <option value="priority">Sort: Priority</option>
        </select>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select
          value={order}
          onChange={(e) =>
            onOrderChange(e.target.value as SortOrder)
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 sm:w-auto"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-left text-sm font-medium text-gray-600 hover:text-gray-900 sm:text-right"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}