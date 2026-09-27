"use client";
import { useState, type FormEvent } from "react";
import { useDemo } from "@/hooks/demo-provider";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { submitReview } from "./review-rules";
export function ReviewForm({ bookingId }: { bookingId: string }) {
  const { data, setData } = useDemo();
  const [notice, setNotice] = useState("");
  const existing = data.reviews.find(
    (r) =>
      r.bookingId === bookingId && r.reviewerId === data.currentUser.userId,
  );
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      setData(
        submitReview(data, bookingId, {
          overallRating: Number(f.get("overallRating")),
          behaviourRating: Number(f.get("behaviourRating")),
          punctualityRating: Number(f.get("punctualityRating")),
          profileAccuracyRating: Number(f.get("profileAccuracyRating")),
          wouldBookAgain: f.get("again") === "on",
          comment: String(f.get("comment")).trim(),
        }),
      );
      setNotice(
        "Review saved in this preview. Rating updated locally; Trust Score recalculation requires the backend.",
      );
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Review could not be saved.");
    }
  }
  return (
    <section className="card card-padding stack">
      <h2>Your review</h2>
      {existing ? (
        <>
          <Rating value={existing.overallRating} count={1} />
          <p className="muted">{existing.comment}</p>
          <p className="small muted">
            One review per person is allowed for each completed booking.
          </p>
        </>
      ) : (
        <form className="stack" onSubmit={save}>
          <div className="grid-2">
            {[
              { key: "overallRating", label: "Overall experience" },
              { key: "behaviourRating", label: "Behaviour / respect" },
              { key: "punctualityRating", label: "Punctuality" },
              { key: "profileAccuracyRating", label: "Profile accuracy" },
            ].map((r) => (
              <label className="field" key={r.key}>
                {r.label}
                <select className="input" name={r.key} required defaultValue="">
                  <option value="" disabled>
                    Select a rating
                  </option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} / 5
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <label className="checkbox-row">
            <input type="checkbox" name="again" />I would book or meet again
          </label>
          <label className="field">
            Your experience
            <textarea className="input" name="comment" maxLength={2000} />
          </label>
          <Button type="submit">Save review preview</Button>
        </form>
      )}
      {notice && (
        <p role="status" className="small muted">
          {notice}
        </p>
      )}
    </section>
  );
}
