import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveUserProfile, useUserProfile } from "../hooks/useQueries";

export default function ProfilePage() {
  const { loginStatus, login, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const principal = identity?.getPrincipal().toString();

  const { data: profile, isLoading } = useUserProfile();
  const saveProfile = useSaveUserProfile();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  async function handleSave() {
    try {
      await saveProfile.mutateAsync({
        username: username.trim(),
        bio: bio.trim(),
      });
      toast.success("Profile saved!");
      setEditing(false);
    } catch {
      toast.error("Failed to save profile");
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-6" />
        <h1 className="font-serif text-3xl font-bold text-foreground mb-3">
          Your Profile
        </h1>
        <p className="text-muted-foreground font-sans text-sm mb-8">
          Sign in to view and edit your profile.
        </p>
        <Button
          onClick={() => login()}
          disabled={loginStatus === "logging-in"}
          data-ocid="profile.primary_button"
          className="bg-foreground text-background hover:bg-muted-foreground font-sans text-xs tracking-widest uppercase"
        >
          {loginStatus === "logging-in" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Toaster />
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Profile
        </h1>
        <p className="text-muted-foreground font-sans text-xs mt-2 font-mono break-all">
          {principal}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4" data-ocid="profile.loading_state">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats */}
          {profile && (
            <div className="grid grid-cols-3 gap-4 border border-border p-4 bg-card">
              {[
                { label: "Rating", value: profile.rating.toString() },
                { label: "Games", value: profile.gamesPlayed.toString() },
                { label: "Wins", value: profile.wins.toString() },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-serif text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground font-sans text-xs uppercase tracking-widest mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Edit form */}
          {editing ? (
            <div className="space-y-4 border border-border bg-card p-4">
              <div>
                <Label className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
                  Username
                </Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                  data-ocid="profile.input"
                  className="bg-background font-sans"
                />
              </div>
              <div>
                <Label className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
                  Bio
                </Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others about yourself..."
                  data-ocid="profile.textarea"
                  className="bg-background font-sans resize-none h-24"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={saveProfile.isPending}
                  data-ocid="profile.save_button"
                  size="sm"
                  className="bg-foreground text-background hover:bg-muted-foreground font-sans text-xs tracking-widest uppercase"
                >
                  {saveProfile.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  ) : null}
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(false)}
                  data-ocid="profile.cancel_button"
                  className="font-sans text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="border border-border bg-card p-4 space-y-3">
              <div>
                <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Username
                </p>
                <p className="font-serif text-foreground text-lg">
                  {profile?.username || (
                    <span className="text-muted-foreground italic text-sm">
                      Not set
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Bio
                </p>
                <p className="font-sans text-foreground text-sm leading-relaxed">
                  {profile?.bio || (
                    <span className="text-muted-foreground italic">
                      No bio yet
                    </span>
                  )}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                data-ocid="profile.edit_button"
                className="font-sans text-xs tracking-widest uppercase mt-2"
              >
                Edit Profile
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
