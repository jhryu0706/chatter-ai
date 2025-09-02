// app/devices/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";

type DeviceJSON = Pick<
  MediaDeviceInfo,
  "deviceId" | "kind" | "label" | "groupId"
>;

export default function Page() {
  const [devices, setDevices] = useState<DeviceJSON[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      // Ensure labels are visible (no-op if already granted)
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {}
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices(
        list.map(({ deviceId, kind, label, groupId }) => ({
          deviceId,
          kind,
          label: label || "(hidden until permission granted)",
          groupId,
        }))
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
    navigator.mediaDevices.addEventListener("devicechange", load);
    return () =>
      navigator.mediaDevices.removeEventListener("devicechange", load);
  }, [load]);

  return (
    <div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <pre className="text-xs bg-neutral-100 p-3 rounded">
        {JSON.stringify(devices, null, 2)}
      </pre>
    </div>
  );
}
