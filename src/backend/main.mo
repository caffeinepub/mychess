import List "mo:core/List";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module Post {
    public func compare(post1 : Post, post2 : Post) : Order.Order {
      if (post1.createdAt < post2.createdAt) { #less } else if (post1.createdAt > post2.createdAt) {
        #greater;
      } else { #equal };
    };
  };

  type CommunityId = Nat;
  type PostId = Nat;
  type NotationGameId = Nat;

  public type UserProfile = {
    displayName : Text;
    rating : Nat;
    gamesPlayed : Nat;
    wins : Nat;
    losses : Nat;
    draws : Nat;
  };

  type Community = {
    id : CommunityId;
    name : Text;
    description : Text;
    owner : Principal;
    members : [Principal];
    createdAt : Time.Time;
  };

  type Post = {
    communityId : CommunityId;
    author : Principal;
    title : Text;
    content : Text;
    createdAt : Time.Time;
  };

  type NotationGame = {
    id : NotationGameId;
    title : Text;
    pgn : Text;
    owner : Principal;
    createdAt : Time.Time;
  };

  var nextCommunityId = 0;
  var nextPostId = 0;
  var nextNotationGameId = 0;

  let communities = Map.empty<CommunityId, Community>();
  let communityPosts = Map.empty<CommunityId, List.List<Post>>();
  let notationGames = Map.empty<NotationGameId, NotationGame>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Community functions

  public shared ({ caller }) func createCommunity(name : Text, description : Text) : async CommunityId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create communities");
    };
    let id = nextCommunityId;
    nextCommunityId += 1;
    let community = {
      id;
      name;
      description;
      owner = caller;
      members = [caller];
      createdAt = Time.now();
    };
    communities.add(id, community);
    communityPosts.add(id, List.empty<Post>());
    id;
  };

  public query ({ caller }) func listCommunities() : async [Community] {
    communities.values().toArray();
  };

  public shared ({ caller }) func joinCommunity(id : CommunityId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join communities");
    };
    let community = switch (communities.get(id)) {
      case (null) { Runtime.trap("Community not found") };
      case (?c) { c };
    };
    if (community.members.find(func(member) { member == caller }) == null) {
      let updatedCommunity = {
        community with
        members = community.members.concat([caller]);
      };
      communities.add(id, updatedCommunity);
    };
  };

  public shared ({ caller }) func leaveCommunity(id : CommunityId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can leave communities");
    };
    let community = switch (communities.get(id)) {
      case (null) { Runtime.trap("Community not found") };
      case (?c) { c };
    };
    let filteredMembers = community.members.filter(func(member) { member != caller });
    let updatedCommunity = {
      community with
      members = filteredMembers;
    };
    communities.add(id, updatedCommunity);
  };

  public query ({ caller }) func getCommunity(id : CommunityId) : async Community {
    switch (communities.get(id)) {
      case (null) { Runtime.trap("Community not found") };
      case (?community) { community };
    };
  };

  public shared ({ caller }) func createPost(communityId : CommunityId, title : Text, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };
    switch (communities.get(communityId)) {
      case (null) { Runtime.trap("Community not found") };
      case (?community) {
        if (community.members.find(func(member) { member == caller }) == null) {
          Runtime.trap("Not a member of the community");
        };
        let post = {
          communityId;
          author = caller;
          title;
          content;
          createdAt = Time.now();
        };
        switch (communityPosts.get(communityId)) {
          case (null) { Runtime.trap("Community not found") };
          case (?posts) {
            posts.add(post);
          };
        };
      };
    };
  };

  public query ({ caller }) func listPosts(communityId : CommunityId) : async [Post] {
    switch (communityPosts.get(communityId)) {
      case (null) { Runtime.trap("Community not found") };
      case (?posts) { posts.toArray().sort() };
    };
  };

  // Notation game functions

  public shared ({ caller }) func saveNotationGame(title : Text, pgn : Text) : async NotationGameId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save notation games");
    };
    let id = nextNotationGameId;
    nextNotationGameId += 1;
    let game = {
      id;
      title;
      pgn;
      owner = caller;
      createdAt = Time.now();
    };
    notationGames.add(id, game);
    id;
  };

  public query ({ caller }) func listNotationGames() : async [NotationGame] {
    notationGames.values().toArray();
  };

  public query ({ caller }) func getNotationGame(id : NotationGameId) : async NotationGame {
    switch (notationGames.get(id)) {
      case (null) { Runtime.trap("Game not found") };
      case (?game) { game };
    };
  };

  public shared ({ caller }) func deleteNotationGame(id : NotationGameId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete notation games");
    };
    switch (notationGames.get(id)) {
      case (null) { Runtime.trap("Game not found") };
      case (?game) {
        if (game.owner != caller) { Runtime.trap("Unauthorized: Not the owner of the game") };
        notationGames.remove(id);
      };
    };
  };

  // User profile functions

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updateDisplayName(displayName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update display name");
    };
    let profile = switch (userProfiles.get(caller)) {
      case (null) {
        {
          displayName;
          rating = 1200;
          gamesPlayed = 0;
          wins = 0;
          losses = 0;
          draws = 0;
        };
      };
      case (?p) { { p with displayName } };
    };
    userProfiles.add(caller, profile);
  };
};
