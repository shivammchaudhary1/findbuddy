"use client";
import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDemo } from "@/hooks/demo-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export function AuthForm({ register = false }: { register?: boolean }) {
  const { data } = useDemo();
  const [notice, setNotice] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.currentTarget.reset();
    setNotice(
      register
        ? "Registration is not connected in this preview. No account was created and no details were saved."
        : "Sign-in is not connected in this preview. No credentials were sent or saved.",
    );
  }
  return (
    <main id="main-content" className="container page">
      <div className="auth-layout card">
        <div className="auth-photo">
          <Image
            src={data.site.heroImage}
            alt={data.site.heroImageAlt}
            fill
            sizes="50vw"
          />
          <div>
            <h2>{data.site.heroTitle}</h2>
            <p>{data.site.tagline}</p>
          </div>
        </div>
        <div className="auth-form stack">
          <p className="eyebrow">Real people. Real plans.</p>
          <h1>{register ? "Your next chapter starts here" : "Welcome back"}</h1>
          <p className="muted">
            {register
              ? "Make room for new people and shared experiences."
              : "Good company is just around the corner."}
          </p>
          <form className="stack" onSubmit={submit}>
            {register && (
              <Input
                id="auth-name"
                name="name"
                label="Your name"
                required
                autoComplete="name"
              />
            )}
            <Input
              id="auth-email"
              name="email"
              label="Email"
              type="email"
              required
              autoComplete="email"
            />
            <Input
              id="auth-password"
              name="password"
              label="Password"
              type="password"
              required
              minLength={8}
              autoComplete={register ? "new-password" : "current-password"}
            />
            <Button type="submit">
              {register ? "Preview registration" : "Preview sign in"}
            </Button>
            {notice && (
              <p className="form-message" role="status">
                {notice}
              </p>
            )}
            <p className="muted small">
              Preview only. Account creation and sign-in are not connected. Do
              not enter real credentials.
            </p>
          </form>
          <p className="small">
            {register ? "Already have an account? " : "New around here? "}
            <Link className="accent" href={register ? "/login" : "/register"}>
              {register ? "Log in" : "Get started"}
            </Link>
          </p>
          <Link className="text-link" href="/profile">
            Explore the sample account
          </Link>
        </div>
      </div>
    </main>
  );
}
