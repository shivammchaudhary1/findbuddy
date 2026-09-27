import type { InputHTMLAttributes } from "react";
export function Input({
  label,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return (
    <label className="field" htmlFor={id}>
      {label}
      <input className="input" id={id} {...props} />
    </label>
  );
}
