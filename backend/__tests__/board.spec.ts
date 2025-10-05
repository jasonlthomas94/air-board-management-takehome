/// <reference types="jest" />
import request, { Response } from "supertest";
import express from "express";
import { AppDataSource } from "../src/data-source";
import { Board } from "../src/entities/board";
import boardRoutes from "../src/routes/board.routes";
const app = express();
app.use(express.json());
app.use("/api/boards", boardRoutes);

beforeAll(async () => {
  await AppDataSource.initialize();
});

afterAll(async () => {
  await AppDataSource.destroy();
});

beforeEach(async () => {
  const repo = AppDataSource.getRepository(Board);
  await repo.clear();
});

describe("Board API integration tests", () => {
  it("creates a new root board", async () => {
    const res: Response = await request(app)
      .post("/api/boards")
      .send({ name: "Root Board" })
      .expect(201);

    expect(res.body.name).toBe("Root Board");
  });

  it("creates a child board", async () => {
    const parent = await request(app)
      .post("/api/boards")
      .send({ name: "Parent Board" });

    const res: Response = await request(app)
      .post("/api/boards")
      .send({ name: "Child Board", parentId: parent.body.id })
      .expect(201);

    expect(res.body.parent.id).toBe(parent.body.id);
  });

  it("does not allow more than 10 levels deep", async () => {
    let parentId: number | null = null;
    for (let i = 0; i < 10; i++) {
      const res: Response = await request(app)
        .post("/api/boards")
        .send({ name: `Level ${i}`, parentId })
        .expect(201);
      parentId = res.body.id;
    }

    // Attempt 11th level
    await request(app)
      .post("/api/boards")
      .send({ name: "Too Deep", parentId })
      .expect(400); // or whatever you throw for validation
  });

  it("deletes a board and its children", async () => {
    const root = await request(app)
      .post("/api/boards")
      .send({ name: "Root for Delete" });
    const child = await request(app)
      .post("/api/boards")
      .send({ name: "Child to Delete", parentId: root.body.id });

    await request(app).delete(`/api/boards/${root.body.id}`).expect(204);

    const allBoards = await request(app).get("/api/boards");
    expect(allBoards.body.length).toBe(0);
  });

  it("moves a board under a new parent", async () => {
    const root1 = await request(app)
      .post("/api/boards")
      .send({ name: "Root 1" });
    const root2 = await request(app)
      .post("/api/boards")
      .send({ name: "Root 2" });

    // Move Root 1 under Root 2
    await request(app)
      .patch(`/api/boards/${root1.body.id}/move`)
      .send({ newParentId: root2.body.id })
      .expect(200);

    const all = await request(app).get("/api/boards").expect(200);

    // Find root2 in the hierarchy
    const root2Node = all.body.find((b: any) => b.id === root2.body.id);
    const childIds = root2Node.children.map((c: any) => c.id);

    expect(childIds).toContain(root1.body.id);
  });
});
