import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

import { mockPrisma, resetMockDb } from "./prisma.mock.js";

vi.mock("../lib/prisma.js", () => {
  return {
    prisma: mockPrisma,
  };
});

import app from "../app.js";

describe("Ticket API", () => {
  beforeEach(() => {
    resetMockDb();
  });

  it("GET /api/health returns API status and database connected", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "API is running",
      database: "connected",
    });
  });

  it("rejects invalid priority query", async () => {
    const response = await request(app).get(
      "/api/tickets?priority=URGENT",
    );

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Invalid query parameters",
    );
  });

  it("accepts empty string query parameters without throwing 400", async () => {
    const response = await request(app).get(
      "/api/tickets?search=&customer=",
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual([]);
  });

  it("rejects malformed JSON payload with 400 Bad Request instead of 500", async () => {
    const response = await request(app)
      .post("/api/tickets")
      .set("Content-Type", "application/json")
      .send("{ malformed json");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Malformed JSON payload");
  });

  it("rejects empty update body with root-level validation error", async () => {
    const createRes = await request(app)
      .post("/api/tickets")
      .send({
        customerName: "Alice",
        title: "Test ticket",
        description: "Valid description",
      });

    const ticketId = createRes.body.data.id;

    const response = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors._root).toBe("At least one field is required");
  });

  it("returns 404 before validating an update for a missing ticket", async () => {
    const response = await request(app)
      .put("/api/tickets/00000000-0000-0000-0000-000000000000")
      .send({ title: "" });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Ticket not found");
  });

  it("rejects invalid ticket data (too short or too long)", async () => {
    const shortRes = await request(app)
      .post("/api/tickets")
      .send({
        customerName: "A",
        title: "B",
        description: "C",
        priority: "HIGH",
      });

    expect(shortRes.status).toBe(400);
    expect(shortRes.body.success).toBe(false);
    expect(shortRes.body.errors.customerName).toBeDefined();

    const longRes = await request(app)
      .post("/api/tickets")
      .send({
        customerName: "A".repeat(101),
        title: "Valid Title",
        description: "Valid description here.",
      });

    expect(longRes.status).toBe(400);
    expect(longRes.body.success).toBe(false);
    expect(longRes.body.errors.customerName).toBe(
      "Customer name cannot exceed 100 characters",
    );
  });

  it("status filter does not distort counts of other statuses in stats", async () => {
    await request(app).post("/api/tickets").send({
      customerName: "Customer 1",
      title: "Open Ticket",
      description: "Description of open ticket",
      status: "OPEN",
    });

    const ticket2 = await request(app).post("/api/tickets").send({
      customerName: "Customer 2",
      title: "Resolved Ticket",
      description: "Description of resolved ticket",
      status: "OPEN",
    });

    await request(app).put(`/api/tickets/${ticket2.body.data.id}`).send({
      status: "RESOLVED",
    });

    // Request with status=RESOLVED filter
    const response = await request(app).get("/api/tickets?status=RESOLVED");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].status).toBe("RESOLVED");
    // Stats must still reflect the OPEN ticket
    expect(response.body.stats.OPEN).toBe(1);
    expect(response.body.stats.RESOLVED).toBe(1);
  });

  it("creates, reads, updates, filters, and deletes a ticket", async () => {
    const uniqueCustomer = `Test Customer ${Date.now()}`;

    const createResponse = await request(app)
      .post("/api/tickets")
      .send({
        customerName: uniqueCustomer,
        title: "API test ticket",
        description: "Created by automated API test.",
        priority: "HIGH",
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);

    const ticketId = createResponse.body.data.id;
    expect(ticketId).toBeDefined();
    expect(createResponse.body.data.status).toBe("OPEN");
    expect(createResponse.body.data.priority).toBe("HIGH");

    const getResponse = await request(app).get(
      `/api/tickets/${ticketId}`,
    );

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.data.id).toBe(ticketId);

    const filterResponse = await request(app).get(
      `/api/tickets?customer=${encodeURIComponent(uniqueCustomer)}`,
    );

    expect(filterResponse.status).toBe(200);
    expect(filterResponse.body.data).toHaveLength(1);
    expect(filterResponse.body.data[0].id).toBe(ticketId);

    const updateResponse = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .send({
        status: "RESOLVED",
        priority: "MEDIUM",
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.status).toBe("RESOLVED");
    expect(updateResponse.body.data.priority).toBe("MEDIUM");

    const deleteResponse = await request(app).delete(
      `/api/tickets/${ticketId}`,
    );

    expect(deleteResponse.status).toBe(204);

    const missingResponse = await request(app).get(
      `/api/tickets/${ticketId}`,
    );

    expect(missingResponse.status).toBe(404);
    expect(missingResponse.body.success).toBe(false);
  });
});
