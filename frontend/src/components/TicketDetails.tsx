import { useState } from "react";
import {
  AlertTriangle,
  Check,
  Loader2,
  Trash2,
  X,
} from "lucide-react";

import {
  useDeleteTicket,
  useUpdateTicket,
} from "../hooks/useTicketMutations";

import type {
  Priority,
  Status,
  Ticket,
} from "../types/ticket";

interface TicketDetailsProps {
  ticket: Ticket;
  onClose: () => void;
}

const statusLabels: Record<Status, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const priorityLabels: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export default function TicketDetails({
  ticket,
  onClose,
}: TicketDetailsProps) {
  const updateMutation = useUpdateTicket();
  const deleteMutation = useDeleteTicket();

  const [customerName, setCustomerName] = useState(ticket.customerName);
  const [title, setTitle] = useState(ticket.title);
  const [description, setDescription] = useState(ticket.description);
  const [status, setStatus] = useState<Status>(ticket.status);
  const [priority, setPriority] = useState<Priority>(ticket.priority);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    updateMutation.mutate(
      {
        id: ticket.id,
        ticket: {
          customerName,
          title,
          description,
          status,
          priority,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(ticket.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div>
            <p className="text-sm text-gray-500">
              Ticket Details
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {ticket.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Customer Name
            </label>

            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Title
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as Status)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                {Object.entries(statusLabels).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Priority
              </label>

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as Priority)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                {Object.entries(priorityLabels).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          <div className="grid gap-4 border-t border-gray-200 pt-5 text-sm sm:grid-cols-2">
            <div>
              <p className="text-gray-500">Created</p>
              <p className="mt-1 font-medium text-gray-900">
                {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Last updated</p>
              <p className="mt-1 font-medium text-gray-900">
                {new Date(ticket.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          {updateMutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {updateMutation.error instanceof Error
                ? updateMutation.error.message
                : "Failed to update ticket."}
            </div>
          )}

          {deleteMutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {deleteMutation.error instanceof Error
                ? deleteMutation.error.message
                : "Failed to delete ticket."}
            </div>
          )}

          {!showDeleteConfirm ? (
            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
                Delete Ticket
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex gap-3">
                <AlertTriangle
                  className="shrink-0 text-red-600"
                  size={20}
                />

                <div className="flex-1">
                  <h3 className="font-semibold text-red-800">
                    Delete this ticket?
                  </h3>

                  <p className="mt-1 text-sm text-red-700">
                    This action cannot be undone.
                  </p>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setShowDeleteConfirm(false)
                      }
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? (
                        <>
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 size={16} />
                          Yes, Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
