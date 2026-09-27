import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
export function buttonClass(
  variant: Variant = "primary",
  small = false,
): string {
  return `button button-${variant}${small ? " button-small" : ""}`;
}
export function Button({
  variant = "primary",
  small = false,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      className={`${buttonClass(variant, small)} ${className}`}
      {...props}
    />
  );
}
export function ButtonLink({
  href,
  children,
  variant = "primary",
  small = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  small?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={`${buttonClass(variant, small)} ${className}`}>
      {children}
    </Link>
  );
}
