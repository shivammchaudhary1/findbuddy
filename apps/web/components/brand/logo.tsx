import Image from "next/image";
import Link from "next/link";
export function Logo({ symbolOnly = false }: { symbolOnly?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="FindBuddy home">
      <span className="brand-symbol">
        <Image src="/brand/findbuddy-symbol.png" alt="" fill sizes="38px" />
      </span>
      {!symbolOnly && (
        <span className="brand-wordmark">
          Find<span>Buddy</span>
        </span>
      )}
    </Link>
  );
}
