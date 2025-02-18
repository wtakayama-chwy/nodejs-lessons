import fastify from "fastify";
import { transactionsRoutes } from "./routes/transactions";
import fastifyCookie from "@fastify/cookie";

export const app = fastify();

// Route sequence matters!
app.register(fastifyCookie);
app.register(transactionsRoutes, { prefix: "/transactions" });
