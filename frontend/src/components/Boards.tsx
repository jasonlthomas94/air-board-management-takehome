"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

// Define backend base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

type Board = {
  id: number;
  name: string;
  parent: Board | null;
  children: Board[];
};

export default function Boards() {
  const queryClient = useQueryClient();

  // Fetch boards
  const {
    data: boards,
    isLoading,
    isError,
  } = useQuery<Board[]>({
    queryKey: ["boards"],
    queryFn: async () => (await axios.get(`${API_BASE}/boards`)).data,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: { name: string; parentId?: number }) =>
      axios.post(`${API_BASE}/boards`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["boards"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => axios.delete(`${API_BASE}/boards/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["boards"] }),
  });

  const moveMutation = useMutation({
    mutationFn: (payload: { id: number; newParentId: number | null }) =>
      axios.patch(`${API_BASE}/boards/${payload.id}/move`, {
        newParentId: payload.newParentId,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["boards"] }),
  });

  // Local form state
  const [newBoardName, setNewBoardName] = useState("");
  const [selectedParentBoard, setSelectedParentBoard] = useState<{
    name: string;
    id: number;
  } | null>(null);

  function getDepth(board: Board, currentDepth = 0): number {
    if (!board.children || board.children.length === 0) return currentDepth;
    return Math.max(
      ...board.children.map((child) => getDepth(child, currentDepth + 1))
    );
  }

  function flattenBoards(boardList: Board[]): Board[] {
    return boardList.flatMap((b) => [b, ...flattenBoards(b.children || [])]);
  }

  const allBoards = flattenBoards(boards || []);

  // render board tree recursively
  const renderBoard = (board: Board, depth = 0) => (
    <div
      key={board.id}
      className="ml-4 border-l pl-4 mt-2 flex flex-col flex-grow"
    >
      <div className="flex items-center justify-between">
        <span className="text-black">
          {"—".repeat(depth)} {board.name}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => deleteMutation.mutate(board.id)}
            className="text-red-500 hover:underline"
          >
            Delete
          </button>
          {depth < 9 ? (
            <button
              onClick={() => setSelectedParentBoard(board)}
              className="text-blue-600 hover:underline"
            >
              Add Child
            </button>
          ) : (
            <button
              disabled
              title="Maximum depth reached (10 levels) — cannot add more children"
              className="text-gray-400 cursor-not-allowed"
            >
              Add Child
            </button>
          )}
          {depth > 0 && (
            <button
              onClick={() =>
                moveMutation.mutate({ id: board.id, newParentId: null })
              }
              className="text-gray-500 hover:underline"
            >
              Move to Root
            </button>
          )}
          <select
            className="border rounded p-1 text-black w-40"
            onChange={(e) => {
              const newParentId = parseInt(e.target.value);
              if (!isNaN(newParentId)) {
                moveMutation.mutate({ id: board.id, newParentId });
              }
            }}
            defaultValue=""
          >
            <option value="">Move under...</option>
            {allBoards
              .filter((b) => {
                if (b.id === board.id) return false; // don't move under self
                const targetDepth = getDepth(b);
                // current board's depth (to avoid exceeding 10)
                return depth + targetDepth + 1 <= 10;
              })
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
          </select>
        </div>
      </div>
      {board.children?.map((child) => renderBoard(child, depth + 1))}
    </div>
  );

  // Handle new board creation
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    createMutation.mutate({
      name: newBoardName,
      parentId: selectedParentBoard?.id || undefined,
    });

    setNewBoardName("");
    setSelectedParentBoard(null);
  };

  // Render
  if (isLoading) return <p className="p-4">Loading boards...</p>;
  if (isError) return <p className="p-4 text-red-500">Error loading boards.</p>;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Board Management
      </h1>

      {/* New board form */}
      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          placeholder={
            selectedParentBoard
              ? `New board under ${selectedParentBoard.name} (ID ${selectedParentBoard.id})`
              : "New root board name"
          }
          className="flex-1 border p-2 rounded text-black placeholder-gray-400"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create
        </button>
        {selectedParentBoard && (
          <button
            type="button"
            onClick={() => setSelectedParentBoard(null)}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Clear
          </button>
        )}
      </form>

      {/* Board hierarchy */}
      <div className="max-w-full overflow-x-auto p-6 bg-white shadow rounded-lg">
        {boards && boards.length > 0 ? (
          boards.map((board) => renderBoard(board))
        ) : (
          <p className="text-gray-500 italic">
            No boards yet. Create one above.
          </p>
        )}
      </div>
    </div>
  );
}
