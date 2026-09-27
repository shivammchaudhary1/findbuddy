"use client";
import { useState, type FormEvent } from "react";
import { Flag, ShieldOff } from "lucide-react";
import { useDemo } from "@/hooks/demo-provider";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
export function SafetyActions({ userId }: { userId: string }) {
  const { data, setData } = useDemo();
  const [action, setAction] = useState<"block" | "report" | null>(null);
  const [notice, setNotice] = useState("");
  const current = data.currentUser.userId;
  if (current === userId) return null;
  function report(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget),
      description = String(form.get("description")).trim();
    if (!description) return;
    setData((previous) => ({
      ...previous,
      reports: [
        ...previous.reports,
        {
          _id: crypto.randomUUID(),
          reporterId: current,
          reportedUserId: userId,
          category: String(form.get("category")),
          description,
          severity: "LOW",
          status: "OPEN",
        },
      ],
    }));
    setAction(null);
    setNotice(
      "Report recorded in this preview only. No moderation team was notified.",
    );
  }
  function block() {
    setData((previous) => ({
      ...previous,
      blocks: [
        ...previous.blocks,
        { blockerId: current, blockedUserId: userId },
      ],
    }));
    setAction(null);
  }
  return (
    <div className="stack">
      <div className="row">
        <Button variant="ghost" small onClick={() => setAction("report")}>
          <Flag size={16} /> Report user
        </Button>
        <Button variant="ghost" small onClick={() => setAction("block")}>
          <ShieldOff size={16} /> Block user
        </Button>
      </div>
      {notice && (
        <p role="status" className="small muted">
          {notice}
        </p>
      )}
      {action && (
        <Dialog
          title={action === "block" ? "Block this user?" : "Report a concern"}
          onClose={() => setAction(null)}
        >
          {action === "block" ? (
            <>
              <p className="muted">
                Their profile and activities will be hidden and you cannot send
                new requests or messages to each other in this preview. You can
                unblock them from your profile. Reloading resets the change.
              </p>
              <Button onClick={block}>Block in preview</Button>
            </>
          ) : (
            <form className="stack" onSubmit={report}>
              <label className="field">
                Concern category
                <select className="input" name="category">
                  <option>Profile accuracy</option>
                  <option>Inappropriate behaviour</option>
                  <option>Safety concern</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="field">
                What happened?
                <textarea
                  className="input"
                  name="description"
                  required
                  maxLength={2000}
                />
              </label>
              <p className="small muted">
                Preview only. This form does not contact support or emergency
                services.
              </p>
              <Button type="submit">Save report preview</Button>
            </form>
          )}
        </Dialog>
      )}
    </div>
  );
}
