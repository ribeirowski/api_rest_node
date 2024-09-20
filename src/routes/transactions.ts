import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "node:crypto";
import { checkSessionId } from "../middlewares/checkSessionId";

export async function transactionsRoutes(app: FastifyInstance) {
  app.post("/", async (request, response) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body
    );

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();
      response.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id: sessionId,
    });

    return response.status(201).send();
  });

  app.get(
    "/",
    {
      preHandler: [checkSessionId],
    },
    async (request) => {
      const { sessionId } = request.cookies;

      const transactions = await knex("transactions")
        .where("session_id", sessionId)
        .select();
      return {
        transactions,
      };
    }
  );

  app.get(
    "/:id",
    {
      preHandler: [checkSessionId],
    },
    async (request) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      });
      const { sessionId } = request.cookies;
      const { id } = getTransactionParamsSchema.parse(request.params);
      const transaction = await knex("transactions")
        .where({ session_id: sessionId, id: id })
        .first();

      return {
        transaction,
      };
    }
  );

  app.get(
    "/summary",
    {
      preHandler: [checkSessionId],
    },
    async (request) => {
      const { sessionId } = request.cookies;
      const summary = await knex("transactions")
        .sum("amount", { as: "amount" })
        .where("session_id", sessionId)
        .first();
      return {
        summary,
      };
    }
  );
}
