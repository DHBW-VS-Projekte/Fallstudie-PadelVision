import Image from "next/image";

export default function LogoMark({
  className = "",
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "light";
}) {
  return (
    <Image
      src={variant === "light" ? "/images/Logo-light-transparent.png" : "/images/Logo-transparent.png"}
      alt=""
      aria-hidden="true"
      width={183}
      height={286}
      className={`pv-logo-mark ${className}`}
    />
  );
}