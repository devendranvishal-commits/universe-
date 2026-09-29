"use client";

import { useEffect } from "react";
import { createClient } from "../../../../lib/client";

const HEARTBEAT_INTERVAL = 30_000;

export default function useUserPresence() {
  useEffect(() => {
    const supabase = createClient();

    let mounted = true;
    let currentUserId = "";
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

    async function updatePresence(isOnline: boolean) {
      if (!currentUserId) {
        return;
      }

      const now = new Date().toISOString();

      const { error } = await supabase
        .from("user_presence")
        .upsert(
          {
            user_id: currentUserId,
            is_online: isOnline,
            last_seen: now,
            updated_at: now,
          },
          {
            onConflict: "user_id",
          }
        );

      if (error) {
        console.error(
          "Could not update user presence:",
          error.message
        );
      }
    }

    async function initializePresence() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (error) {
        console.error(
          "Could not load user for presence:",
          error.message
        );
        return;
      }

      if (!user) {
        return;
      }

      currentUserId = user.id;

      await updatePresence(true);

      heartbeatTimer = setInterval(() => {
        void updatePresence(true);
      }, HEARTBEAT_INTERVAL);
    }

    function handleVisibilityChange() {
      if (!currentUserId) {
        return;
      }

      if (document.visibilityState === "visible") {
        void updatePresence(true);
      } else {
        void updatePresence(false);
      }
    }

    function handleFocus() {
      void updatePresence(true);
    }

    function handleBlur() {
      void updatePresence(false);
    }

    function handleBeforeUnload() {
      if (!currentUserId) {
        return;
      }

      void updatePresence(false);
    }

    initializePresence();

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      mounted = false;

      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
      }

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );

      void updatePresence(false);
    };
  }, []);
}