import logo from "@/assets/pulso-logo.jpg";
import { cn } from "@/lib/utils";

interface PulsoLogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}

export function PulsoLogo({ size = 36, className, showWordmark = true }: PulsoLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src={logo}
        alt="Pulso Nobre"
        width={size}
        height={size}
        loading="lazy"
        className="rounded-lg ring-1 ring-border object-cover"
        style={{ width: size, height: size }}
      />
      {showWordmark ? (
        <div className="flex flex-col leading-none">
          <span className="font-display text-lg tracking-wide text-foreground">Pulso</span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Nobre
          </span>
        </div>
      ) : null}
    </div>
  );
}
