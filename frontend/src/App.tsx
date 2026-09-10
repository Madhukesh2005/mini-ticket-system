import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Ticket as TicketIcon,
} from "lucide-react";

import TicketCard from "./components/TicketCard";
import TicketDetails from "./components/TicketDetails";
import TicketFilters, {
  type SortField,
  type SortOrder,
} from "./components/TicketFilters";
import TicketForm from "./components/TicketForm";

import { useTickets } from "./hooks/useTickets";

import type {
  Priority,
  Status,
  Ticket,
} from "./types/ticket";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const getInitialParams = () => {
  if (typeof window === "undefined") {
    return {
      search: "",
      status: "" as Status | "",
      priority: "" as Priority | "",
      customer: "",
      sortBy: "createdAt" as SortField,
      order: "desc" as SortOrder,
      page: 1,
    };
  }

  const params = new URLSearchParams(window.location.search);
  const rawStatus = params.get("status") || "";
  const rawPriority = params.get("priority") || "";
  const rawSortBy = params.get("sortBy") || "createdAt";
  const rawOrder = params.get("order") || "desc";
  const rawPage = parseInt(params.get("page") || "1", 10);

  return {
    search: params.get("search") || "",
    status: (["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(rawStatus)
      ? rawStatus
      : "") as Status | "",
    priority: (["LOW", "MEDIUM", "HIGH"].includes(rawPriority)
      ? rawPriority
      : "") as Priority | "",
    customer: params.get("customer") || "",
    sortBy: ([
      "createdAt",
      "updatedAt",
      "title",
      "customerName",
      "priority",
      "status",
    ].includes(rawSortBy)
      ? rawSortBy
      : "createdAt") as SortField,
    order: (rawOrder === "asc" ? "asc" : "desc") as SortOrder,
    page: !isNaN(rawPage) && rawPage > 0 ? rawPage : 1,
  };
};

function App() {
  const initial = getInitialParams();

  const [search, setSearch] = useState(initial.search);
  const [status, setStatus] = useState<Status | "">(initial.status);
  const [priority, setPriority] = useState<Priority | "">(initial.priority);
  const [customer, setCustomer] = useState(initial.customer);

  const [sortBy, setSortBy] =
    useState<SortField>(initial.sortBy);

  const [order, setOrder] =
    useState<SortOrder>(initial.order);

  const [page, setPage] = useState(initial.page);

  const [selectedTicket, setSelectedTicket] =
    useState<Ticket | null>(null);

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const debouncedSearch = useDebounce(search, 350);
  const debouncedCustomer = useDebounce(customer, 350);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    if (customer) params.set("customer", customer);
    if (sortBy !== "createdAt") params.set("sortBy", sortBy);
    if (order !== "desc") params.set("order", order);
    if (page > 1) params.set("page", String(page));

    const qs = params.toString();
    const newUrl = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname;

    window.history.replaceState(null, "", newUrl);
  }, [search, status, priority, customer, sortBy, order, page]);

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useTickets({
    search: debouncedSearch,
    status,
    priority,
    customer: debouncedCustomer,
    page,
    limit: 10,
    sortBy,
    order,
  });

  const tickets = data?.data ?? [];
  const pagination = data?.pagination;
  const stats = data?.stats;

  // When a deletion empties the current page, step back to the previous page.
  // The setState call is intentional here — this is a reactive correction, not
  // a synchronization side-effect. The eslint rule is suppressed for this line.
  useEffect(() => {
    if (!isLoading && !isError && tickets.length === 0 && page > 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPage((prev) => Math.max(1, prev - 1));
    }
  }, [isLoading, isError, tickets.length, page]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: Status | "") => {
    setStatus(value);
    setPage(1);
  };

  const handlePriorityChange = (value: Priority | "") => {
    setPriority(value);
    setPage(1);
  };

  const handleCustomerChange = (value: string) => {
    setCustomer(value);
    setPage(1);
  };

  const handleSortByChange = (value: SortField) => {
    setSortBy(value);
    setPage(1);
  };

  const handleOrderChange = (value: SortOrder) => {
    setOrder(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setPriority("");
    setCustomer("");
    setPage(1);
  };

  const statCards = [
    {
      label: "Total Tickets",
      value: stats
        ? stats.OPEN +
          stats.IN_PROGRESS +
          stats.RESOLVED +
          stats.CLOSED
        : 0,
    },
    {
      label: "Open",
      value: stats?.OPEN ?? 0,
    },
    {
      label: "In Progress",
      value: stats?.IN_PROGRESS ?? 0,
    },
    {
      label: "Resolved",
      value: stats?.RESOLVED ?? 0,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white">
              <TicketIcon size={22} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Service Tickets
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage customer support tickets.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-gray-700"
          >
            <Plus size={18} />
            New Ticket
          </button>
        </header>

        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <p className="text-sm text-gray-500">
                  {stat.label}
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mb-6">
          <TicketFilters
            search={search}
            status={status}
            priority={priority}
            customer={customer}
            sortBy={sortBy}
            order={order}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onCustomerChange={handleCustomerChange}
            onSortByChange={handleSortByChange}
            onOrderChange={handleOrderChange}
            onClear={handleClearFilters}
          />
        </div>

        {isLoading && (
          <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
            <p className="text-sm text-gray-500">
              Loading tickets...
            </p>
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-medium">
              Failed to load tickets
            </p>

            <p className="mt-1 text-sm">
              {error instanceof Error
                ? error.message
                : "Something went wrong."}
            </p>
          </div>
        )}

        {!isLoading && !isError && tickets.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <TicketIcon
                size={22}
                className="text-gray-500"
              />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No tickets found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Try changing your filters or create a new ticket.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-5">
              {page > 1 && (
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Return to page 1
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
              >
                <Plus size={16} />
                Create Ticket
              </button>
            </div>
          </div>
        )}

        {!isLoading && !isError && tickets.length > 0 && (
          <>
            <div
              className={`grid gap-4 md:grid-cols-2 xl:grid-cols-3 ${
                isFetching ? "opacity-60" : ""
              }`}
            >
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onSelect={setSelectedTicket}
                />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600">
                  Page {pagination.page} of{" "}
                  {pagination.totalPages}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={
                      pagination.page <= 1 ||
                      isFetching
                    }
                    onClick={() =>
                      setPage((current) => current - 1)
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={
                      pagination.page >=
                        pagination.totalPages ||
                      isFetching
                    }
                    onClick={() =>
                      setPage((current) => current + 1)
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {selectedTicket && (
          <TicketDetails
            key={selectedTicket.id}
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
        )}

        {showCreateForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setShowCreateForm(false)}
          >
            <div
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <TicketForm
                onSuccess={() => setShowCreateForm(false)}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;