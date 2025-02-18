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

// E2E tests
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

  test("user should be able to list all transactions", async () => {
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

  test("user should be able to get a specific transaction", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send(mockTransaction)
      .expect(201);

    const cookies = createTransactionResponse.headers["set-cookie"];

    const listTransactionsResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    const transactionId = listTransactionsResponse.body.transactions[0].id;

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: mockTransaction.title,
        amount: mockTransaction.amount,
      })
    );
  });

  test("user should be able to get the summary", async () => {
    const debitAmount = 4000;

    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send(mockTransaction)
      .expect(201);

    const cookies = createTransactionResponse.headers["set-cookie"];

    await request(app.server)
      .post("/transactions")
      .set("Cookie", cookies)
      .send({
        title: "Debit transaction",
        amount: debitAmount,
        type: "debit",
      })
      .expect(201);

    const summaryResponse = await request(app.server)
      .get("/transactions/summary")
      .set("Cookie", cookies)
      .expect(200);

    expect(summaryResponse.body.balance).toEqual(
      expect.objectContaining({ amount: mockTransaction.amount - debitAmount })
    );
  });
});
