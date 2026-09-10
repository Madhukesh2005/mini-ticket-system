import { randomUUID } from "node:crypto";

export interface MockTicket {
  id: string;
  customerName: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: Date;
  updatedAt: Date;
}

export interface MockComment {
  id: string;
  author: string;
  message: string;
  ticketId: string;
  createdAt: Date;
}

let ticketsStore: MockTicket[] = [];
let commentsStore: MockComment[] = [];

export const resetMockDb = () => {
  ticketsStore = [];
  commentsStore = [];
};

export const seedMockTicket = (ticket: Partial<MockTicket>): MockTicket => {
  const now = new Date();
  const newTicket: MockTicket = {
    id: ticket.id || randomUUID(),
    customerName: ticket.customerName || "Test Customer",
    title: ticket.title || "Test Ticket",
    description: ticket.description || "Test Description",
    priority: ticket.priority || "MEDIUM",
    status: ticket.status || "OPEN",
    createdAt: ticket.createdAt || now,
    updatedAt: ticket.updatedAt || now,
  };
  ticketsStore.push(newTicket);
  return newTicket;
};

const matchesWhere = (ticket: MockTicket, where?: Record<string, any>): boolean => {
  if (!where) return true;

  if (where.id && ticket.id !== where.id) {
    return false;
  }

  if (where.status && ticket.status !== where.status) {
    return false;
  }

  if (where.priority && ticket.priority !== where.priority) {
    return false;
  }

  if (where.customerName?.contains) {
    const term = String(where.customerName.contains).toLowerCase();
    if (!ticket.customerName.toLowerCase().includes(term)) {
      return false;
    }
  }

  if (where.OR && Array.isArray(where.OR)) {
    const matchesOr = where.OR.some((condition: any) => {
      if (condition.title?.contains) {
        const term = String(condition.title.contains).toLowerCase();
        if (ticket.title.toLowerCase().includes(term)) return true;
      }
      if (condition.customerName?.contains) {
        const term = String(condition.customerName.contains).toLowerCase();
        if (ticket.customerName.toLowerCase().includes(term)) return true;
      }
      return false;
    });
    if (!matchesOr) return false;
  }

  return true;
};

export const mockPrisma = {
  ticket: {
    findMany: async (args?: any) => {
      let result = ticketsStore.filter((t) => matchesWhere(t, args?.where));

      if (args?.orderBy) {
        const [field, dir] = Object.entries(args.orderBy)[0] as [keyof MockTicket, "asc" | "desc"];
        result.sort((a, b) => {
          const valA = a[field];
          const valB = b[field];
          if (valA < valB) return dir === "asc" ? -1 : 1;
          if (valA > valB) return dir === "asc" ? 1 : -1;
          return 0;
        });
      }

      const skip = args?.skip || 0;
      const take = args?.take || result.length;
      return result.slice(skip, skip + take);
    },

    findUnique: async (args: { where: { id: string }; select?: any }) => {
      const ticket = ticketsStore.find((t) => t.id === args.where.id);
      if (!ticket) return null;
      if (args.select) {
        const selected: any = {};
        for (const key of Object.keys(args.select)) {
          if (args.select[key]) selected[key] = (ticket as any)[key];
        }
        return selected;
      }
      return ticket;
    },

    create: async (args: { data: any }) => {
      const now = new Date();
      const newTicket: MockTicket = {
        id: randomUUID(),
        customerName: args.data.customerName,
        title: args.data.title,
        description: args.data.description,
        priority: args.data.priority || "MEDIUM",
        status: args.data.status || "OPEN",
        createdAt: now,
        updatedAt: now,
      };
      ticketsStore.push(newTicket);
      return newTicket;
    },

    update: async (args: { where: { id: string }; data: any }) => {
      const index = ticketsStore.findIndex((t) => t.id === args.where.id);
      if (index === -1) throw new Error("Record to update not found.");
      ticketsStore[index] = {
        ...ticketsStore[index],
        ...args.data,
        updatedAt: new Date(),
      };
      return ticketsStore[index];
    },

    delete: async (args: { where: { id: string } }) => {
      const index = ticketsStore.findIndex((t) => t.id === args.where.id);
      if (index === -1) throw new Error("Record to delete not found.");
      const deleted = ticketsStore.splice(index, 1)[0];
      // Cascade delete comments
      commentsStore = commentsStore.filter((c) => c.ticketId !== args.where.id);
      return deleted;
    },

    deleteMany: async (args?: { where?: any }) => {
      const initialCount = ticketsStore.length;
      if (!args?.where) {
        ticketsStore = [];
        commentsStore = [];
        return { count: initialCount };
      }
      ticketsStore = ticketsStore.filter((t) => !matchesWhere(t, args.where));
      return { count: initialCount - ticketsStore.length };
    },

    count: async (args?: any) => {
      return ticketsStore.filter((t) => matchesWhere(t, args?.where)).length;
    },

    groupBy: async (args: { by: string[]; where?: any; _count?: any }) => {
      const filtered = ticketsStore.filter((t) => matchesWhere(t, args.where));
      const groupMap: Record<string, number> = {};
      for (const item of filtered) {
        const key = item.status;
        groupMap[key] = (groupMap[key] || 0) + 1;
      }
      return Object.entries(groupMap).map(([status, count]) => ({
        status,
        _count: { _all: count },
      }));
    },
  },

  comment: {
    findMany: async (args?: { where?: { ticketId?: string }; orderBy?: any }) => {
      let result = commentsStore.filter((c) =>
        args?.where?.ticketId ? c.ticketId === args.where.ticketId : true,
      );
      result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      return result;
    },

    create: async (args: { data: { author: string; message: string; ticketId: string } }) => {
      const newComment: MockComment = {
        id: randomUUID(),
        author: args.data.author,
        message: args.data.message,
        ticketId: args.data.ticketId,
        createdAt: new Date(),
      };
      commentsStore.push(newComment);
      return newComment;
    },

    deleteMany: async (args?: { where?: { ticketId?: string } }) => {
      const count = commentsStore.length;
      const ticketId = args?.where?.ticketId;
      if (ticketId) {
        commentsStore = commentsStore.filter((c) => c.ticketId !== ticketId);
      } else {
        commentsStore = [];
      }
      return { count: count - commentsStore.length };
    },
  },

  $queryRaw: async () => [{ 1: 1 }],
  $disconnect: async () => {},
};
