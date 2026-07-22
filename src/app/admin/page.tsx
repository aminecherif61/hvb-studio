import Image from "next/image";
import LoginCard from "./LoginCard";

export default function VaultLoginPage() {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden px-6 py-16">
      {/* Cinematic backdrop, heavily darkened so the card carries the light */}
      <Image
        src="/images/hamdi/weddings/wedding-golden-car-architecture.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-[0.16] blur-[2px]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" aria-hidden />
      <LoginCard />
    </div>
  );
}
