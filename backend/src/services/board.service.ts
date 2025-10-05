import { IsNull } from "typeorm";
import { AppDataSource } from "../data-source";
import { Board } from "../entities/board";

const boardRepo = AppDataSource.getRepository(Board);

async function getDepth(board: Board | null): Promise<number> {
  let depth = 0;
  while (board?.parent) {
    depth++;
    board = await boardRepo.findOne({
      where: { id: board.parent.id },
      relations: ["parent"],
    });
  }
  return depth;
}

async function buildHierarchy(board: Board): Promise<Board> {
  const children = await boardRepo.find({
    where: { parent: { id: board.id } },
    relations: ["parent"],
  });

  board.children = await Promise.all(children.map(buildHierarchy));
  return board;
}

export const BoardService = {
  async createBoard(name: string, parentId?: number) {
    let parent: Board | null = null;

    if (parentId) {
      parent = await boardRepo.findOne({
        where: { id: parentId },
        relations: {
          parent: true,
        },
      });
      if (!parent) throw new Error("Parent not found");
      const depth = await getDepth(parent);
      if (depth >= 9) throw new Error("Cannot exceed 10 levels of depth");
    }

    const board = boardRepo.create({ name, parent });
    return boardRepo.save(board);
  },

  async deleteBoard(id: number) {
    const board = await boardRepo.findOne({ where: { id } });
    if (!board) throw new Error("Board not found");
    await boardRepo.remove(board);
  },

  async moveBoard(id: number, newParentId: number | null) {
    const board = await boardRepo.findOne({
      where: { id },
      relations: {
        parent: true,
      },
    });
    if (!board) throw new Error("Board not found");

    const newParent = newParentId
      ? await boardRepo.findOne({
          where: { id: newParentId },
          relations: {
            parent: true,
          },
        })
      : null;

    if (newParent) {
      const depth = await getDepth(newParent);
      if (depth >= 9) throw new Error("Cannot exceed 10 levels of depth");
    }

    board.parent = newParent;
    return boardRepo.save(board);
  },

  async listBoards() {
    // find all the root boards
    const roots = await boardRepo.find({
      where: { parent: IsNull() },
      relations: ["parent"],
    });

    // recursively find all the children
    // not the best for performance, but because max depth is 10 we should be fine
    return Promise.all(roots.map(buildHierarchy));
  },
};
