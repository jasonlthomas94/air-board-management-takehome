import { Router } from "express";
import { BoardController } from "../controllers/board.controller";

const router = Router();

router.post("/", BoardController.create);
router.delete("/:id", BoardController.delete);
router.patch("/:id/move", BoardController.move);
router.get("/", BoardController.list);

export default router;
