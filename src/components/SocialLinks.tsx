import { Instagram, MessageCircle } from "lucide-react";
import { useStore } from "@/lib/store";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.5 3c.3 2.1 1.6 3.6 3.7 3.9v2.5c-1.4.1-2.7-.3-3.9-1.1v5.6c0 3.4-2.5 5.9-5.8 5.9A5.7 5.7 0 0 1 4.8 14c0-3.2 2.6-5.8 5.8-5.8.3 0 .6 0 .9.1v2.7a3 3 0 1 0 2.2 2.9V3h2.8Z" />
    </svg>
  );
}

export function SocialLinks({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" }) {
  const { settings } = useStore();
  const icon = size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]";
  const btn =
    size === "sm"
      ? "h-8 w-8"
      : "h-9 w-9";

  const links = [
    settings.whatsapp
      ? { href: `https://wa.me/${settings.whatsapp}`, label: "WhatsApp", node: <MessageCircle className={icon} /> }
      : null,
    settings.instagram
      ? { href: settings.instagram, label: "Instagram", node: <Instagram className={icon} /> }
      : null,
    settings.tiktok ? { href: settings.tiktok, label: "TikTok", node: <TikTokIcon className={icon} /> } : null,
  ].filter(Boolean) as { href: string; label: string; node: React.ReactNode }[];

  if (links.length === 0) return null;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noreferrer"
          aria-label={l.label}
          className={`inline-flex ${btn} items-center justify-center rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition active:scale-95`}
        >
          {l.node}
        </a>
      ))}
    </div>
  );
}
