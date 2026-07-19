import { Star } from "lucide-react";

export function Rating({ value = 0, count, size = 14, showCount = true }: { value?: number; count?: number; size?: number; showCount?: boolean }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < full || (i === full && half);
          return (
            <Star
              key={i}
              style={{ width: size, height: size }}
              className={filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}
            />
          );
        })}
      </div>
      {showCount && (
        <span className="text-[11px] text-muted-foreground">
          {value.toFixed(1)}{count != null ? ` (${count.toLocaleString()})` : ""}
        </span>
      )}
    </div>
  );
}
