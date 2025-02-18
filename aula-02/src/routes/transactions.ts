import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req) => {
      const { sessionId } = req.cookies;

      const transactions = await knex("transactions")
        .where({ session_id: sessionId })
        .select("*");

      // Prefer returning objects as this makes it easier to add more properties in the future
      return { transactions };
    }
  );

  app.get(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req) => {
      const getTransactionReqParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getTransactionReqParamsSchema.parse(req.params);

      const { sessionId } = req.cookies;

      // If we don't use first it will return an array with one element
      const transaction = await knex("transactions")
        .where({ id, session_id: sessionId })
        .first();

      return { transaction };
    }
  );

  app.get(
    "/summary",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req) => {
      const { sessionId } = req.cookies;
      const balance = await knex("transactions")
        .where({ session_id: sessionId })
        // Rename the column to "amount" so it's easier to access in the response
        .sum("amount", { as: "amount" })
        .first();

      return { balance };
    }
  );

  app.post("/", async (req, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { amount, title, type } = createTransactionBodySchema.parse(req.body);

    let sessionId = req.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();
      reply.setCookie("sessionId", sessionId, {
        // Which routes can access this cookie
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week in seconds
      });
    }

    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      created_at: new Date().toISOString(),
      session_id: sessionId,
    });

    return reply.status(201).send();
  });
}
