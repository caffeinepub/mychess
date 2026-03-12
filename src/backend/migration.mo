import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  public type OldCommunity = {
    id : Nat;
    name : Text;
    description : Text;
    owner : Principal.Principal;
    members : [Principal.Principal];
    createdAt : Time.Time;
  };

  public type OldPost = {
    communityId : Nat;
    author : Principal.Principal;
    title : Text;
    content : Text;
    createdAt : Time.Time;
  };

  public type OldNotationGame = {
    id : Nat;
    title : Text;
    pgn : Text;
    owner : Principal.Principal;
    createdAt : Time.Time;
  };

  public type OldUserProfile = {
    displayName : Text;
    rating : Nat;
    gamesPlayed : Nat;
    wins : Nat;
    losses : Nat;
    draws : Nat;
  };

  public type OldActor = {
    nextCommunityId : Nat;
    nextPostId : Nat;
    nextNotationGameId : Nat;
    communities : Map.Map<Nat, OldCommunity>;
    communityPosts : Map.Map<Nat, List.List<OldPost>>;
    notationGames : Map.Map<Nat, OldNotationGame>;
    userProfiles : Map.Map<Principal.Principal, OldUserProfile>;
  };

  // New type definitions (should match final actor)
  public type Community = {
    id : Nat;
    name : Text;
    description : Text;
    owner : Principal.Principal;
    createdAt : Time.Time;
  };

  public type CommunityPost = {
    id : Nat;
    communityId : Nat;
    author : Principal.Principal;
    title : Text;
    content : Text;
    createdAt : Time.Time;
  };

  public type Notation = {
    id : Nat;
    title : Text;
    pgn : Text;
    description : Text;
    photoBlobId : ?Text;
    owner : Principal.Principal;
    createdAt : Time.Time;
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

  public type NewActor = {
    nextCommunityId : Nat;
    nextPostId : Nat;
    nextNotationId : Nat;
    communities : Map.Map<Nat, Community>;
    communityPosts : Map.Map<Nat, List.List<CommunityPost>>;
    notations : Map.Map<Nat, Notation>;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let newCommunities = old.communities.map<Nat, OldCommunity, Community>(
      func(_, oldCommunity) {
        {
          id = oldCommunity.id;
          name = oldCommunity.name;
          description = oldCommunity.description;
          owner = oldCommunity.owner;
          createdAt = oldCommunity.createdAt;
        };
      }
    );

    let newCommunityPosts = old.communityPosts.map<Nat, List.List<OldPost>, List.List<CommunityPost>>(
      func(_, oldPosts) {
        oldPosts.map(
          func(oldPost) {
            {
              id = 0; // Placeholder as we can't restore original id
              communityId = oldPost.communityId;
              author = oldPost.author;
              title = oldPost.title;
              content = oldPost.content;
              createdAt = oldPost.createdAt;
            };
          }
        );
      }
    );

    let newNotations = old.notationGames.map<Nat, OldNotationGame, Notation>(
      func(_, oldGame) {
        {
          id = oldGame.id;
          title = oldGame.title;
          pgn = oldGame.pgn;
          description = "";
          photoBlobId = null;
          owner = oldGame.owner;
          createdAt = oldGame.createdAt;
        };
      }
    );

    let newUserProfiles = old.userProfiles.map<Principal.Principal, OldUserProfile, UserProfile>(
      func(_, oldProfile) {
        {
          username = oldProfile.displayName;
          bio = "";
          rating = oldProfile.rating;
          gamesPlayed = oldProfile.gamesPlayed;
          wins = oldProfile.wins;
          losses = oldProfile.losses;
          draws = oldProfile.draws;
        };
      }
    );

    {
      nextCommunityId = old.nextCommunityId;
      nextPostId = old.nextPostId;
      nextNotationId = old.nextNotationGameId;
      communities = newCommunities;
      communityPosts = newCommunityPosts;
      notations = newNotations;
      userProfiles = newUserProfiles;
    };
  };
};
