import request from "supertest";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";
import { app } from "../src/app";
import { execSync } from "child_process";

const mockTransaction = {
  title: "New transaction",
  type: "credit",
  amount: 9000,
};

describe("Transactions routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("pnpm knex migrate:rollback --all");
    execSync("pnpm knex migrate:latest");
  });

  test("user should be able to create a new transaction", async () => {
    await request(app.server)
      .post("/transactions")
      .send(mockTransaction)
      .expect(201);
  });

  test.only("user should be able to get a transaction", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send(mockTransaction)
      .expect(201);

    const cookies = createTransactionResponse.headers["set-cookie"];

    const listTransactionsResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);
    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: mockTransaction.title,
        amount: mockTransaction.amount,
      }),
    ]);
  });
});
