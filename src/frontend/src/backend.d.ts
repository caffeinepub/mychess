import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type CommunityId = bigint;
export type Time = bigint;
export interface Post {
    title: string;
    content: string;
    communityId: CommunityId;
    createdAt: Time;
    author: Principal;
}
export interface NotationGame {
    id: NotationGameId;
    pgn: string;
    title: string;
    owner: Principal;
    createdAt: Time;
}
export interface Community {
    id: CommunityId;
    members: Array<Principal>;
    owner: Principal;
    name: string;
    createdAt: Time;
    description: string;
}
export type NotationGameId = bigint;
export interface UserProfile {
    displayName: string;
    gamesPlayed: bigint;
    wins: bigint;
    losses: bigint;
    rating: bigint;
    draws: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCommunity(name: string, description: string): Promise<CommunityId>;
    createPost(communityId: CommunityId, title: string, content: string): Promise<void>;
    deleteNotationGame(id: NotationGameId): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommunity(id: CommunityId): Promise<Community>;
    getNotationGame(id: NotationGameId): Promise<NotationGame>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    joinCommunity(id: CommunityId): Promise<void>;
    leaveCommunity(id: CommunityId): Promise<void>;
    listCommunities(): Promise<Array<Community>>;
    listNotationGames(): Promise<Array<NotationGame>>;
    listPosts(communityId: CommunityId): Promise<Array<Post>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveNotationGame(title: string, pgn: string): Promise<NotationGameId>;
    updateDisplayName(displayName: string): Promise<void>;
}
