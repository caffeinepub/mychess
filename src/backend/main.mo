import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

// Persistent state types
(with migration = Migration.run)
actor {
  public type CommunityId = Nat;
  public type PostId = Nat;
  public type NotationId = Nat;
  public type ChallengeId = Nat;
  public type TimeControl = {
    initialTime : Nat;
    increment : Nat;
  };

  public type UserProfile = {
    username : Text;
    bio : Text;
    rating : Nat;
    gamesPlayed : Nat;
    wins : Nat;
    losses : Nat;
    draws : Nat;
  };

  public type Community = {
    id : CommunityId;
    name : Text;
    description : Text;
    owner : Principal;
    createdAt : Time.Time;
  };

  public type CommunityPost = {
    id : PostId;
    communityId : CommunityId;
    author : Principal;
    title : Text;
    content : Text;
    createdAt : Time.Time;
  };

  public type Notation = {
    id : NotationId;
    title : Text;
    pgn : Text;
    description : Text;
    photoBlobId : ?Text;
    owner : Principal;
    createdAt : Time.Time;
  };

  public type Challenge = {
    id : ChallengeId;
    creator : Principal;
    timeControl : TimeControl;
    colorPref : Text;
    createdAt : Time.Time;
    acceptedBy : ?Principal;
  };

  var nextCommunityId = 1;
  var nextPostId = 1;
  var nextNotationId = 1;
  var nextChallengeId = 1;

  let communities = Map.empty<CommunityId, Community>();
  let communityPosts = Map.empty<CommunityId, List.List<CommunityPost>>();
  let notations = Map.empty<NotationId, Notation>();
  let challenges = Map.empty<ChallengeId, Challenge>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  type CommunityMembers = Map.Map<CommunityId, List.List<Principal>>;
  let communityMembers : CommunityMembers = Map.empty<CommunityId, List.List<Principal>>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

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
      createdAt = Time.now();
    };
    communities.add(id, community);
    communityPosts.add(id, List.empty<CommunityPost>());
    let members = List.empty<Principal>();
    members.add(caller);
    communityMembers.add(id, members);
    id;
  };

  public query ({ caller }) func listCommunities() : async [Community] {
    communities.values().toArray();
  };

  public query ({ caller }) func getCommunity(id : CommunityId) : async ?Community {
    communities.get(id);
  };

  public shared ({ caller }) func joinCommunity(id : CommunityId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join communities");
    };
    switch (communities.get(id)) {
      case (null) { Runtime.trap("Community not found") };
      case (?_) {
        let members = switch (communityMembers.get(id)) {
          case (null) { List.empty<Principal>() };
          case (?m) { m };
        };
        if (not members.any(func(member) { member == caller })) {
          members.add(caller);
          communityMembers.add(id, members);
        };
      };
    };
  };

  public shared ({ caller }) func leaveCommunity(id : CommunityId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can leave communities");
    };
    switch (communities.get(id)) {
      case (null) { Runtime.trap("Community not found") };
      case (?_) {
        switch (communityMembers.get(id)) {
          case (null) { Runtime.trap("Community not found") };
          case (?members) {
            let filteredMembers = members.filter(func(member) { member != caller });
            communityMembers.add(id, filteredMembers);
          };
        };
      };
    };
  };

  public query ({ caller }) func getCommunityMembers(communityId : CommunityId) : async [Principal] {
    switch (communityMembers.get(communityId)) {
      case (null) { [] };
      case (?members) { members.toArray() };
    };
  };

  public shared ({ caller }) func createPost(communityId : CommunityId, title : Text, content : Text) : async PostId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };
    switch (communities.get(communityId)) {
      case (null) { Runtime.trap("Community not found") };
      case (?_) {
        switch (communityMembers.get(communityId)) {
          case (null) { Runtime.trap("Not a member of the community") };
          case (?members) {
            if (not members.any(func(member) { member == caller })) {
              Runtime.trap("Not a member of the community");
            };
            let id = nextPostId;
            nextPostId += 1;
            let post = {
              id;
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
                id;
              };
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func listPosts(communityId : CommunityId) : async [CommunityPost] {
    switch (communityPosts.get(communityId)) {
      case (null) { [] };
      case (?posts) {
        posts.toArray().sort();
      };
    };
  };

  module CommunityPost {
    public func compare(post1 : CommunityPost, post2 : CommunityPost) : Order.Order {
      Int.compare(post2.createdAt, post1.createdAt);
    };
  };

  public query ({ caller }) func getPost(communityId : CommunityId, postId : PostId) : async ?CommunityPost {
    switch (communityPosts.get(communityId)) {
      case (null) { null };
      case (?posts) {
        posts.toArray().find(func(post) { post.id == postId });
      };
    };
  };

  // Notation functions

  public shared ({ caller }) func saveNotation(title : Text, pgn : Text, description : Text, photoBlobId : ?Text) : async NotationId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save notations");
    };
    let id = nextNotationId;
    nextNotationId += 1;
    let notation = {
      id;
      title;
      pgn;
      description;
      photoBlobId;
      owner = caller;
      createdAt = Time.now();
    };
    notations.add(id, notation);
    id;
  };

  public query ({ caller }) func listNotations() : async [Notation] {
    notations.values().toArray();
  };

  public query ({ caller }) func getNotation(id : NotationId) : async ?Notation {
    notations.get(id);
  };

  public shared ({ caller }) func deleteNotation(id : NotationId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete notations");
    };
    switch (notations.get(id)) {
      case (null) { Runtime.trap("Notation not found") };
      case (?notation) {
        if (notation.owner != caller) { Runtime.trap("Unauthorized: Not the owner of the notation") };
        notations.remove(id);
      };
    };
  };

  // Challenge functions

  public shared ({ caller }) func createChallenge(timeControl : TimeControl, colorPref : Text) : async ChallengeId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create challenges");
    };
    let id = nextChallengeId;
    nextChallengeId += 1;
    let challenge = {
      id;
      creator = caller;
      timeControl;
      colorPref;
      createdAt = Time.now();
      acceptedBy = null;
    };
    challenges.add(id, challenge);
    id;
  };

  public query ({ caller }) func listOpenChallenges() : async [Challenge] {
    challenges.values().toArray().filter(func(challenge) { challenge.acceptedBy == null });
  };

  public shared ({ caller }) func acceptChallenge(id : ChallengeId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept challenges");
    };
    switch (challenges.get(id)) {
      case (null) { Runtime.trap("Challenge not found") };
      case (?challenge) {
        if (challenge.acceptedBy != null) {
          Runtime.trap("Challenge already accepted");
        };
        let updatedChallenge = { challenge with acceptedBy = ?caller };
        challenges.add(id, updatedChallenge);
      };
    };
  };

  public shared ({ caller }) func cancelChallenge(id : ChallengeId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel challenges");
    };
    switch (challenges.get(id)) {
      case (null) { Runtime.trap("Challenge not found") };
      case (?challenge) {
        if (challenge.creator != caller) {
          Runtime.trap("Unauthorized: Not the creator of the challenge");
        };
        if (challenge.acceptedBy != null) {
          Runtime.trap("Cannot cancel accepted challenge");
        };
        challenges.remove(id);
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
    // Reads are public - anyone can view any profile
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(username : Text, bio : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let profile = switch (userProfiles.get(caller)) {
      case (null) {
        {
          username;
          bio;
          rating = 1200;
          gamesPlayed = 0;
          wins = 0;
          losses = 0;
          draws = 0;
        };
      };
      case (?p) { { p with username; bio } };
    };
    userProfiles.add(caller, profile);
  };
};
