import { Request, Response } from "express";
import { BoardService } from "../services/board.service";

export const BoardController = {
  async create(req: Request, res: Response) {
    try {
      const { name, parentId } = req.body;
      const board = await BoardService.createBoard(name, parentId);
      res.status(201).json(board);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await BoardService.deleteBoard(id);
      res.status(204).send();
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async move(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { newParentId } = req.body;
      const updated = await BoardService.moveBoard(id, newParentId);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async list(req: Request, res: Response) {
    try {
      const boards = await BoardService.listBoards();
      res.json(boards);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
};
