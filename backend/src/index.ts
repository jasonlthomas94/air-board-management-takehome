import express, { Request, Response } from "express";
import "reflect-metadata";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import boardRoutes from "./routes/board.routes";
import { AppDataSource } from "./data-source";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:3000", "http://frontend:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: ["http://localhost:3000", "http://frontend:3000"],
    credentials: true,
  })
);

interface HelloResponse {
  message: string;
}

app.get("/api/hello", (_req: Request, res: Response<HelloResponse>) => {
  res.json({ message: "Hello from Express Backend!" });
});

interface NotificationMessage {
  message: string;
}

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Broadcast notification every second
setInterval(() => {
  const notification: NotificationMessage = {
    message: "Server notification: " + new Date().toLocaleString(),
  };
  io.emit("notification", notification);
}, 1000);

const PORT = process.env.PORT || 3001;

AppDataSource.initialize()
  .then(() => {
    console.log("Postgres database connected");

    app.use(express.json());

    app.use("/api/boards", boardRoutes);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
