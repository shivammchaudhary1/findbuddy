"use client";
import { useState, type FormEvent } from "react";
import { useDemo } from "@/hooks/demo-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export function SafetySettings() {
  const { data, setData } = useDemo();
  const [notice, setNotice] = useState("");
  const userId = data.currentUser.userId;
  const contact = data.trustedContacts.find((c) => c.userId === userId);
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name")).trim(),
      contactValue = String(f.get("contact")).trim();
    if (!name || !contactValue) return;
    setData((p) => ({
      ...p,
      trustedContacts: [
        ...p.trustedContacts.filter((c) => c.userId !== userId),
        { userId, name, contactValue },
      ],
    }));
    setNotice(
      "Trusted contact saved in this session only. No notification was sent.",
    );
  }
  return (
    <section className="card card-padding stack">
      <h2>Safety settings</h2>
      <p className="muted small">
        Meet in a public place and share your plans with someone you trust.
      </p>
      <form className="stack" onSubmit={save}>
        <Input
          id="contact-name"
          name="name"
          label="Trusted contact name"
          required
          maxLength={80}
          defaultValue={contact?.name}
        />
        <Input
          id="contact-value"
          name="contact"
          label="Contact phone or email"
          required
          maxLength={120}
          defaultValue={contact?.contactValue}
        />
        <p className="small muted">
          Use sample details in this preview. Emergency alerts and contact
          notifications are not connected.
        </p>
        <div>
          <Button type="submit" variant="secondary">
            Save contact preview
          </Button>
        </div>
      </form>
      {notice && (
        <p role="status" className="small muted">
          {notice}
        </p>
      )}
      <h3>Blocked users</h3>
      {data.blocks
        .filter((b) => b.blockerId === userId)
        .map((b) => (
          <div className="row between" key={b.blockedUserId}>
            <span>
              {data.profiles.find((p) => p.userId === b.blockedUserId)?.name ??
                "Member"}
            </span>
            <Button
              small
              variant="secondary"
              onClick={() =>
                setData((p) => ({
                  ...p,
                  blocks: p.blocks.filter(
                    (x) =>
                      x.blockerId !== userId ||
                      x.blockedUserId !== b.blockedUserId,
                  ),
                }))
              }
            >
              Unblock
            </Button>
          </div>
        ))}
      {!data.blocks.some((b) => b.blockerId === userId) && (
        <p className="muted small">
          You haven&apos;t blocked anyone in this preview.
        </p>
      )}
    </section>
  );
}
