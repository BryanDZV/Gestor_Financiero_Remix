import type { ReactNode } from "react";
import { usePrivacy } from "~/hooks/use-privacy";

export function PrivacyBlur({ children, className = "" }: { children: ReactNode, className?: string }) {
  const { isPrivate } = usePrivacy();
  return (
    <span className={className} style={{ filter: isPrivate ? 'blur(6px)' : 'none', opacity: isPrivate ? 0.6 : 1, transition: 'all 0.2s ease-in-out' }}>
      {children}
    </span>
  );
}