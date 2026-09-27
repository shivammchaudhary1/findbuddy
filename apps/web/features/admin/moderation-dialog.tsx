"use client";
import { useState, type FormEvent } from "react";
import { useDemo } from "@/hooks/demo-provider";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { moderate, type ModerationKind } from "./moderation";
export type ModerationTarget = {
  kind: ModerationKind;
  id: string;
  title: string;
  options?: string[];
};
export function ModerationDialog({
  target,
  onClose,
}: {
  target: ModerationTarget;
  onClose: () => void;
}) {
  const { data, setData, adminId } = useDemo();
  const [error, setError] = useState("");
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      setData(
        moderate(data, adminId, {
          ...target,
          value: String(form.get("value")),
          reason: String(form.get("reason")),
        }),
      );
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not apply this change.");
    }
  }
  return (
    <Dialog title={`Review ${target.title}`} onClose={onClose}>
      <p className="small muted">
        Changes apply only to this preview. The before/after values and your
        reason are added to the session audit log.
      </p>
      <form className="stack" onSubmit={submit}>
        {target.options ? (
          <label className="field">
            Decision
            <select className="input" name="value">
              {target.options.map((v) => (
                <option key={v} value={v}>
                  {v.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <Input
            id="moderation-value"
            label={
              target.kind === "trust" ? "Score adjustment" : "Category name"
            }
            name="value"
            type={target.kind === "trust" ? "number" : "text"}
            min={-100}
            max={100}
            required
          />
        )}
        <label className="field">
          Reason
          <textarea className="input" name="reason" required maxLength={1000} />
        </label>
        {error && <p role="alert">{error}</p>}
        <div className="row">
          <Button type="submit">Apply preview change</Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
