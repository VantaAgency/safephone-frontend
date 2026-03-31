import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "icon";
  dark?: boolean;
  className?: string;
}

export function Logo({ variant = "full", dark = false, className }: LogoProps) {
  if (variant === "icon") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <Image
          src="/SafePhoneLogoFavIcon2.svg"
          alt="SafePhone logo"
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/SafePhoneLogoFavIcon2.svg"
        alt="SafePhone logo"
        width={40}
        height={40}
        className="h-10 w-10 object-contain"
      />
      <span
        className={cn(
          "text-lg font-medium tracking-tighter",
          dark ? "text-white" : "text-indigo-950"
        )}
      >
        SAFEPHONE
      </span>
    </div>
  );
}
