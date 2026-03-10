import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Community, NotationGame, Post } from "../backend.d";
import type { CommunityId, NotationGameId } from "../backend.d";
import { useActor } from "./useActor";

export function useListCommunities() {
  const { actor, isFetching } = useActor();
  return useQuery<Community[]>({
    queryKey: ["communities"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCommunities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCommunity(id: CommunityId | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Community | null>({
    queryKey: ["community", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getCommunity(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useListPosts(communityId: CommunityId | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Post[]>({
    queryKey: ["posts", communityId?.toString()],
    queryFn: async () => {
      if (!actor || communityId === null) return [];
      return actor.listPosts(communityId);
    },
    enabled: !!actor && !isFetching && communityId !== null,
  });
}

export function useListNotationGames() {
  const { actor, isFetching } = useActor();
  return useQuery<NotationGame[]>({
    queryKey: ["notation-games"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listNotationGames();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCommunity() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
    }: { name: string; description: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createCommunity(name, description);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["communities"] }),
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      communityId,
      title,
      content,
    }: {
      communityId: CommunityId;
      title: string;
      content: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createPost(communityId, title, content);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["posts", vars.communityId.toString()],
      }),
  });
}

export function useJoinCommunity() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: CommunityId) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.joinCommunity(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["communities"] }),
  });
}

export function useLeaveCommunity() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: CommunityId) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.leaveCommunity(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["communities"] }),
  });
}

export function useSaveNotationGame() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, pgn }: { title: string; pgn: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveNotationGame(title, pgn);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notation-games"] }),
  });
}

export function useDeleteNotationGame() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: NotationGameId) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteNotationGame(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notation-games"] }),
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}
