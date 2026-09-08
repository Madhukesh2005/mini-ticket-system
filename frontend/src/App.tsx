import { useState } from "react";
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

function App() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status | "">("");
  const [priority, setPriority] = useState<Priority | "">("");
  const [customer, setCustomer] = useState("");

  const [sortBy, setSortBy] =
    useState<SortField>("createdAt");

  const [order, setOrder] =
    useState<SortOrder>("desc");

  const [page, setPage] = useState(1);

  const [selectedTicket, setSelectedTicket] =
    useState<Ticket | null>(null);

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useTickets({
    search,
    status,
    priority,
    customer,
    page,
    limit: 10,
    sortBy,
    order,
  });

  const tickets = data?.data ?? [];
  const pagination = data?.pagination;
  const stats = data?.stats;

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

            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
            >
              <Plus size={16} />
              Create Ticket
            </button>
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
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
        )}

        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
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