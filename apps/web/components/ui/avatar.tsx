import Image from "next/image";
export function Avatar({ src, name }: { src?: string; name: string }) {
  return (
    <span className="avatar">
      {src ? (
        <Image src={src} alt={name} fill sizes="44px" />
      ) : (
        <span aria-label={name}>{name.slice(0, 1)}</span>
      )}
    </span>
  );
}
