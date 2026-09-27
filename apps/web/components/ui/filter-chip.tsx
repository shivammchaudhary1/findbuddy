import type { ButtonHTMLAttributes } from "react";
export function FilterChip({
  active,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean }) {
  return (
    <button type="button" className="chip" aria-pressed={active} {...props} />
  );
}
