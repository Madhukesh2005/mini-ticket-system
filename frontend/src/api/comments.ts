export interface Comment {
  id: string;
  author: string;
  message: string;
  createdAt: string;
  ticketId: string;
}

interface CommentsResponse {
  success: true;
  data: Comment[];
}

interface CommentResponse {
  success: true;
  data: Comment;
}

import { handleResponse } from "./client";

const API_URL =
  import.meta.env.VITE_API_URL || "/api";

export const getComments = async (
  ticketId: string,
  signal?: AbortSignal,
): Promise<CommentsResponse> => {
  const response = await fetch(
    `${API_URL}/tickets/${ticketId}/comments`,
    { signal },
  );

  return handleResponse<CommentsResponse>(response);
};

export const createComment = async (
  ticketId: string,
  comment: {
    author: string;
    message: string;
  },
): Promise<Comment> => {
  const response = await fetch(
    `${API_URL}/tickets/${ticketId}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(comment),
    },
  );

  const result = await handleResponse<CommentResponse>(
    response,
  );

  return result.data;
};
