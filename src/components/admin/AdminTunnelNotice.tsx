"use client";

import { useEffect, useState } from "react";

/** Dev-only note: ngrok HMR websocket errors do not affect admin auth. */
export default function AdminTunnelNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const host = window.location.hostname;
    const onTunnel =
      host.endsWith(".ngrok-free.app") ||
      host.endsWith(".ngrok-free.dev") ||
      host.endsWith(".ngrok.io") ||
      host.endsWith(".ngrok.app");
    setVisible(onTunnel);
  }, []);

  if (!visible) return null;

  return (
    <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
      Tunnel mode: WebSocket HMR errors in the console are normal over ngrok and do not affect admin login.
      Use localhost for hot reload.
    </p>
  );
}
