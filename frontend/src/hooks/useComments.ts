import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createComment,
  getComments,
} from "../api/comments";

export const useComments = (ticketId: string) => {
  return useQuery({
    queryKey: ["comments", ticketId],
    queryFn: ({ signal }) => getComments(ticketId, signal),
    enabled: Boolean(ticketId),
  });
};

export const useCreateComment = (ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: {
      author: string;
      message: string;
    }) => createComment(ticketId, comment),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", ticketId],
      });
    },
  });
};
