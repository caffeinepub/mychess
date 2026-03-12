import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChallengeId, CommunityId, NotationId } from "../backend.d";
import { useActor } from "./useActor";

export function useListCommunities() {
  const { actor, isFetching } = useActor();
  return useQuery({
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
  return useQuery({
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
  return useQuery({
    queryKey: ["posts", communityId?.toString()],
    queryFn: async () => {
      if (!actor || communityId === null) return [];
      return actor.listPosts(communityId);
    },
    enabled: !!actor && !isFetching && communityId !== null,
  });
}

export function useListNotations() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["notations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listNotations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListOpenChallenges() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listOpenChallenges();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
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
    }: { communityId: CommunityId; title: string; content: string }) => {
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

export function useSaveNotation() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      pgn,
      description,
      photoBlobId,
    }: {
      title: string;
      pgn: string;
      description: string;
      photoBlobId: string | null;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveNotation(title, pgn, description, photoBlobId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notations"] }),
  });
}

export function useDeleteNotation() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: NotationId) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteNotation(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notations"] }),
  });
}

export function useCreateChallenge() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      initialTime,
      increment,
      colorPref,
    }: {
      initialTime: bigint;
      increment: bigint;
      colorPref: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createChallenge({ initialTime, increment }, colorPref);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["challenges"] }),
  });
}

export function useAcceptChallenge() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: ChallengeId) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.acceptChallenge(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["challenges"] }),
  });
}

export function useCancelChallenge() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: ChallengeId) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.cancelChallenge(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["challenges"] }),
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      bio,
    }: { username: string; bio: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveCallerUserProfile(username, bio);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}
