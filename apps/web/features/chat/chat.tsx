"use client";
import { useState, useRef, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Send, MessageCircle, Search } from "lucide-react";
import { useDemo } from "@/hooks/demo-provider";
import { canInteract } from "@/lib/data/visibility";
import { timeLabel, dateLabel } from "@findbuddy/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
export function Chat({ id }: { id?: string }) {
  const { data, setData } = useDemo();
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const user = data.currentUser.userId;
  const conversations = data.conversations.filter((c) =>
    c.participantIds.includes(user),
  );
  const active = conversations.find((c) => c._id === id);
  const buddy = data.profiles.find(
    (p) => p.userId === active?.participantIds.find((x) => x !== user),
  );
  const messages = active
    ? data.messages.filter((m) => m.conversationId === active._id)
    : [];
  const blocked = active?.participantIds.some(
    (id) => id !== user && !canInteract(data, id),
  );
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length, id]);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!active || !text || text.length > 2000 || blocked) return;
    setData((previous) => ({
      ...previous,
      messages: [
        ...previous.messages,
        {
          _id: crypto.randomUUID(),
          conversationId: active._id,
          senderId: user,
          type: "TEXT",
          text,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    setDraft("");
    setNotice("Added to this preview only. No message was delivered.");
  }
  return (
    <main id="main-content" className="container page stack">
      <div className="row between">
        <div>
          <p className="eyebrow">Keep the conversation going</p>
          <h1>Messages</h1>
        </div>
        <Link href="/profile" className="text-link">
          My account
        </Link>
      </div>
      <div className={`chat-shell ${id ? "has-active" : ""}`}>
        <aside className="conversation-sidebar">
          <label className="search-field">
            <Search size={16} />
            <input
              aria-label="Search conversations"
              placeholder="Search conversations"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <nav aria-label="Conversations">
            {conversations
              .filter((c) =>
                data.profiles
                  .find(
                    (p) =>
                      p.userId === c.participantIds.find((x) => x !== user),
                  )
                  ?.name.toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((c) => {
                const p = data.profiles.find(
                  (p) => p.userId === c.participantIds.find((x) => x !== user),
                );
                const last = data.messages
                  .filter((m) => m.conversationId === c._id)
                  .at(-1);
                return (
                  <Link
                    className={`conversation-item ${id === c._id ? "selected" : ""}`}
                    key={c._id}
                    href={`/messages/${c._id}`}
                  >
                    <Avatar name={p?.name ?? "Member"} src={p?.image} />
                    <span>
                      <strong>{p?.name ?? "Member unavailable"}</strong>
                      <small>{last?.text ?? "No messages yet"}</small>
                    </span>
                  </Link>
                );
              })}
          </nav>
          {query &&
            !conversations.some((c) =>
              data.profiles
                .find(
                  (p) => p.userId === c.participantIds.find((x) => x !== user),
                )
                ?.name.toLowerCase()
                .includes(query.toLowerCase()),
            ) && (
              <p className="muted small">No conversations match your search.</p>
            )}
          {!conversations.length && (
            <p className="muted small">
              No conversations yet. A relevant booking or plan connection starts
              a conversation.
            </p>
          )}
        </aside>
        <section className="chat-main" aria-label="Active conversation">
          {active && buddy ? (
            <>
              <div className="chat-header">
                <Link
                  href="/messages"
                  className="icon-button chat-back"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={19} />
                </Link>
                <Avatar name={buddy.name} src={buddy.image} />
                <div>
                  <Link href={`/buddies/${buddy.userId}`}>
                    <strong>{buddy.name}</strong>
                  </Link>
                  <p className="muted small">
                    {active.type === "BOOKING"
                      ? "Booking conversation"
                      : "Plan conversation"}
                  </p>
                </div>
              </div>
              <div
                className="chat-history"
                role="log"
                aria-label="Message history"
                aria-live="polite"
              >
                {messages.length ? (
                  <>
                    {messages.map((message, i) => (
                      <div key={message._id}>
                        {(i === 0 ||
                          dateLabel(message.createdAt) !==
                            dateLabel(messages[i - 1].createdAt)) && (
                          <p className="chat-date">
                            {dateLabel(message.createdAt)}
                          </p>
                        )}
                        <div
                          className={`message-bubble ${message.senderId === user ? "outgoing" : "incoming"}`}
                        >
                          <p>{message.text}</p>
                          <time dateTime={message.createdAt}>
                            {timeLabel(message.createdAt)}
                          </time>
                        </div>
                      </div>
                    ))}
                    <div ref={bottom} />
                  </>
                ) : (
                  <EmptyState
                    title="No messages yet"
                    description="Start the conversation about your activity."
                  />
                )}
              </div>
              <div className="chat-compose">
                <form onSubmit={submit}>
                  <input
                    className="input"
                    aria-label="Message"
                    maxLength={2000}
                    placeholder="Type a message…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={blocked}
                  />
                  <Button
                    type="submit"
                    disabled={!draft.trim() || blocked}
                    aria-label="Send message"
                  >
                    <Send size={18} />
                  </Button>
                </form>
                <p className="muted small" role="status">
                  {blocked
                    ? "Messaging is unavailable for a blocked connection."
                    : notice ||
                      "Preview chat · Messages reset when you reload."}
                </p>
              </div>
            </>
          ) : (
            <div className="chat-empty">
              <MessageCircle size={36} />
              <h2>
                {id
                  ? "Conversation unavailable"
                  : "A good plan starts with hello"}
              </h2>
              <p className="muted">
                {id
                  ? "This conversation isn't available to your account."
                  : "Choose a conversation to coordinate your next activity."}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
