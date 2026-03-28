import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let storedId = localStorage.getItem("aasha_session_id");
    if (!storedId) {
      storedId = uuidv4();
      localStorage.setItem("aasha_session_id", storedId);
    }
    setSessionId(storedId);
  }, []);

  return sessionId;
}
