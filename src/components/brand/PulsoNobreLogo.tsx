import logo from "@/assets/pulsonobre-logo.png";
import { cn } from "@/lib/utils";

interface PulsoNobreLogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}

export function PulsoNobreLogo({ size = 36, className, showWordmark = true }: PulsoNobreLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src={logo}
        alt="Pulso Nobre"
        width={size}
        height={size}
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
