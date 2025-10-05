import { DataSource } from "typeorm";
import { Board } from "./entities/board";

export const TestDataSource = new DataSource({
  type: "sqlite",
  database: ":memory:",
  dropSchema: true,
  entities: [Board],
  synchronize: true, // auto create tables
  logging: false,
});
