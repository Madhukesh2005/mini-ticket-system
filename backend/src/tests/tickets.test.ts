import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";

import app from "../app.js";
import { prisma } from "../lib/prisma.js";

describe("Ticket API", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("GET /api/health returns API status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "API is running",
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

  it("rejects invalid ticket data", async () => {
    const response = await request(app)
      .post("/api/tickets")
      .send({
        customerName: "A",
        title: "B",
        description: "C",
        priority: "HIGH",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Validation failed",
    );
  });

  it("creates, reads, updates, filters, and deletes a ticket", async () => {
    const uniqueCustomer = `Test Customer ${Date.now()}`;

    let ticketId: string | undefined;

    try {
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

      ticketId = createResponse.body.data.id;

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
      expect(updateResponse.body.data.status).toBe(
        "RESOLVED",
      );
      expect(updateResponse.body.data.priority).toBe(
        "MEDIUM",
      );

      const deleteResponse = await request(app).delete(
        `/api/tickets/${ticketId}`,
      );

      expect(deleteResponse.status).toBe(204);

      const missingResponse = await request(app).get(
        `/api/tickets/${ticketId}`,
      );

      expect(missingResponse.status).toBe(404);
      expect(missingResponse.body.success).toBe(false);

      ticketId = undefined;
    } finally {
      if (ticketId) {
        await prisma.ticket.deleteMany({
          where: {
            id: ticketId,
          },
        });
      }
    }
  });
});
