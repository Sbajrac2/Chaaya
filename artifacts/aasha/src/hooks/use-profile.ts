import { useState, useEffect, useCallback } from "react";

export interface UserProfile {
  name: string;
  tintHue: number;
}

const STORAGE_KEY = "aasha_profile";

const TINT_OPTIONS = [
  { label: "Violet", hue: 270 },
  { label: "Teal", hue: 175 },
  { label: "Blue", hue: 220 },
  { label: "Rose", hue: 340 },
  { label: "Amber", hue: 35 },
  { label: "Emerald", hue: 150 },
];

export { TINT_OPTIONS };

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch {
        setProfile(null);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveProfile = useCallback((p: UserProfile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    setProfile(p);
  }, []);

  const clearProfile = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(null);
  }, []);

  return { profile, isLoaded, saveProfile, clearProfile };
}
