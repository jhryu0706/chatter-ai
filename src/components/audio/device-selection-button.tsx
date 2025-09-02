"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Check, ChevronDown, RefreshCw, Mic } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type DeviceRow = {
  deviceId: string;
  label: string;
};

export function DeviceSelectButton({
  selectedId,
  onSelect,
  disabled,
}: {
  selectedId?: string;
  onSelect: (id?: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [devices, setDevices] = useState<DeviceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedLabel = useMemo(() => {
    if (!selectedId) return "Default Microphone";
    return (
      devices.find((d) => d.deviceId === selectedId)?.label ??
      "Selected Microphone"
    );
  }, [devices, selectedId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Make labels visible if not already granted
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        s.getTracks().forEach((t) => t.stop());
      } catch {}
      const list = await navigator.mediaDevices.enumerateDevices();
      const micInputs = list
        .filter(
          (d) =>
            d.kind === "audioinput" && d.deviceId && d.deviceId !== "default"
        )
        .map((d) => ({
          deviceId: d.deviceId,
          label: d.label || "(Microphone - allow permission to see name)",
        }));
      setDevices(micInputs);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and keep up-to-date on plug/unplug
  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    navigator.mediaDevices.addEventListener("devicechange", onChange);
    return () =>
      navigator.mediaDevices.removeEventListener("devicechange", onChange);
  }, [refresh]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={!!disabled}
          className="inline-flex items-center gap-2"
        >
          <Mic className="h-4 w-4" />
          <span className="truncate max-w-[14rem]">{selectedLabel}</span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>No microphones found</CommandEmpty>

            <CommandGroup heading="Default">
              <CommandItem
                value="default"
                onSelect={() => {
                  onSelect(undefined); // use system default
                  setOpen(false);
                }}
              >
                <span className="flex-1">Default Microphone</span>
                {!selectedId && <Check className="h-4 w-4 opacity-80" />}
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Inputs">
              {devices.map((d) => (
                <CommandItem
                  key={d.deviceId}
                  value={d.label || d.deviceId}
                  onSelect={() => {
                    onSelect(d.deviceId);
                    setOpen(false);
                  }}
                  title={d.label}
                >
                  <span className="flex-1 truncate">{d.label}</span>
                  {selectedId === d.deviceId && (
                    <Check className="h-4 w-4 opacity-80" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>

          {error && (
            <div className="px-3 py-2 text-xs text-destructive border-t">
              {error}
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
