"use client";
import { useState, type FormEvent } from "react";
import { useDemo } from "@/hooks/demo-provider";
import { profileSchema } from "@findbuddy/validation";
import { isPro } from "@findbuddy/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrustScore } from "@/features/trust/trust-score";
import { SafetySettings } from "@/features/safety/safety-settings";
export function ProfilePage() {
  const { data, setData } = useDemo();
  const [notice, setNotice] = useState("");
  const profile = data.profiles.find(
    (p) => p.userId === data.currentUser.userId,
  );
  if (!profile)
    return (
      <main id="main-content">
        <h1>Profile unavailable</h1>
      </main>
    );
  const pro = isPro(
    data.subscriptions.find((s) => s.userId === profile.userId),
  );
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const result = profileSchema.safeParse({
      ...profile,
      name: f.get("name"),
      city: f.get("city"),
      bio: f.get("bio"),
      interests: String(f.get("interests"))
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
      languages: String(f.get("languages"))
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
      womenOnlyVisibility: f.get("womenOnly") === "on",
    });
    if (!result.success) {
      setNotice(result.error.issues[0].message);
      return;
    }
    setData((previous) => ({
      ...previous,
      profiles: previous.profiles.map((p) =>
        p.userId === result.data.userId ? result.data : p,
      ),
    }));
    setNotice("Profile updated in this session. Changes reset on reload.");
  }
  return (
    <main id="main-content" className="stack">
      <div className="row between">
        <div className="stack">
          <p className="eyebrow">Your little corner</p>
          <h1>My profile</h1>
        </div>
        <ButtonLink
          href={`/buddies/${profile.userId}`}
          variant="secondary"
          small
        >
          Public profile
        </ButtonLink>
      </div>
      <div className="card card-padding row">
        <Avatar src={profile.image} name={profile.name} />
        <div>
          <h2>{profile.name}</h2>
          <p className="muted small">{profile.city}</p>
        </div>
        <Badge tone="brand">
          {profile.isIdentityVerified ? "Identity verified" : "Not verified"}
        </Badge>
      </div>
      <form className="card card-padding stack" onSubmit={save}>
        <h2>About you</h2>
        <div className="grid-2">
          <Input
            id="profile-name"
            label="Name"
            name="name"
            required
            defaultValue={profile.name}
          />
          <Input
            id="profile-city"
            label="City"
            name="city"
            required
            defaultValue={profile.city}
          />
        </div>
        <label className="field">
          Bio
          <textarea
            className="input"
            name="bio"
            maxLength={1000}
            defaultValue={profile.bio}
          />
        </label>
        <Input
          id="profile-interests"
          name="interests"
          label="Interests (comma separated)"
          defaultValue={profile.interests.join(", ")}
        />
        <Input
          id="profile-languages"
          name="languages"
          label="Languages (comma separated)"
          defaultValue={profile.languages.join(", ")}
        />
        {profile.gender === "WOMAN" && (
          <label className="checkbox-row">
            <input
              type="checkbox"
              name="womenOnly"
              disabled={!pro}
              defaultChecked={profile.womenOnlyVisibility}
            />
            Women-only visibility {pro ? "" : "(Pro)"}
          </label>
        )}
        <div className="row">
          <Button type="submit">Save profile preview</Button>
          <span className="muted small">Session-only changes</span>
        </div>
        {notice && (
          <p role="status" className="form-message">
            {notice}
          </p>
        )}
      </form>
      <TrustScore
        trust={data.trustScores.find((t) => t.userId === profile.userId)}
        detailed={pro}
      />
      <SafetySettings />
      <section className="card card-padding stack">
        <h2>Notifications</h2>
        {!data.notifications.some((n) => n.userId === profile.userId) && (
          <p className="muted small">
            You&apos;re all caught up. No notifications yet.
          </p>
        )}
        {data.notifications
          .filter((n) => n.userId === profile.userId)
          .map((n) => (
            <div className="row between" key={n._id}>
              <div>
                <strong>{n.title}</strong>
                <p className="muted small">{n.body}</p>
              </div>
              <Button
                small
                variant="secondary"
                disabled={n.read}
                onClick={() =>
                  setData((previous) => ({
                    ...previous,
                    notifications: previous.notifications.map((x) =>
                      x._id === n._id ? { ...x, read: true } : x,
                    ),
                  }))
                }
              >
                {n.read ? "Read" : "Mark read"}
              </Button>
            </div>
          ))}
      </section>
    </main>
  );
}
