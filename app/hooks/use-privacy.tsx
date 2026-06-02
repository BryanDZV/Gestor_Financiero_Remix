import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface PrivacyContextType {
  isPrivate: boolean;
  togglePrivacy: () => void;
}

export const PrivacyContext = createContext<PrivacyContextType>({
  isPrivate: false,
  togglePrivacy: () => {},
});

export function PrivacyProvider({ children, namespace = "global" }: { children: ReactNode, namespace?: string }) {
  const [isPrivate, setIsPrivate] = useState(false);
  const [mounted, setMounted] = useState(false);
  const storageKey = `gestor-fin-privacy-${namespace}`;

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(storageKey);
    if (saved === "true") setIsPrivate(true);
  }, [storageKey]);

  const togglePrivacy = () => {
    setIsPrivate(prev => {
      const next = !prev;
      localStorage.setItem(storageKey, String(next));
      return next;
    });
  };

  return (
    <PrivacyContext.Provider value={{ isPrivate: mounted ? isPrivate : false, togglePrivacy }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}