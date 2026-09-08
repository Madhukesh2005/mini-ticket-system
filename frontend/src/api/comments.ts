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

const API_URL =
  import.meta.env.VITE_API_URL || "/api";

const handleResponse = async <T>(
  response: Response,
): Promise<T> => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Request failed",
    );
  }

  return data;
};

export const getComments = async (
  ticketId: string,
): Promise<CommentsResponse> => {
  const response = await fetch(
    `${API_URL}/tickets/${ticketId}/comments`,
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
