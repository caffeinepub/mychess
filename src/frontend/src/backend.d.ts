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
export type ChallengeId = bigint;
export interface TimeControl {
    initialTime: bigint;
    increment: bigint;
}
export type PostId = bigint;
export interface Notation {
    id: NotationId;
    pgn: string;
    title: string;
    owner: Principal;
    createdAt: Time;
    description: string;
    photoBlobId?: string;
}
export interface Community {
    id: CommunityId;
    owner: Principal;
    name: string;
    createdAt: Time;
    description: string;
}
export interface CommunityPost {
    id: PostId;
    title: string;
    content: string;
    communityId: CommunityId;
    createdAt: Time;
    author: Principal;
}
export interface Challenge {
    id: ChallengeId;
    creator: Principal;
    colorPref: string;
    createdAt: Time;
    timeControl: TimeControl;
    acceptedBy?: Principal;
}
export type NotationId = bigint;
export interface UserProfile {
    bio: string;
    username: string;
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
    acceptChallenge(id: ChallengeId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelChallenge(id: ChallengeId): Promise<void>;
    createChallenge(timeControl: TimeControl, colorPref: string): Promise<ChallengeId>;
    createCommunity(name: string, description: string): Promise<CommunityId>;
    createPost(communityId: CommunityId, title: string, content: string): Promise<PostId>;
    deleteNotation(id: NotationId): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommunity(id: CommunityId): Promise<Community | null>;
    getCommunityMembers(communityId: CommunityId): Promise<Array<Principal>>;
    getNotation(id: NotationId): Promise<Notation | null>;
    getPost(communityId: CommunityId, postId: PostId): Promise<CommunityPost | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    joinCommunity(id: CommunityId): Promise<void>;
    leaveCommunity(id: CommunityId): Promise<void>;
    listCommunities(): Promise<Array<Community>>;
    listNotations(): Promise<Array<Notation>>;
    listOpenChallenges(): Promise<Array<Challenge>>;
    listPosts(communityId: CommunityId): Promise<Array<CommunityPost>>;
    saveCallerUserProfile(username: string, bio: string): Promise<void>;
    saveNotation(title: string, pgn: string, description: string, photoBlobId: string | null): Promise<NotationId>;
}
