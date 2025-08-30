"use client";

import Image from "next/image";
import { AgentProps } from "@/app/agent/[id]/page";
import { useConversation } from "@elevenlabs/react";
import { useCallback, useEffect, useState } from "react";
import { DeviceSelectButton } from "./device-selection-button";
import { Button } from "../ui/button";

type ConversationProps = { agent: AgentProps };

const MIC_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

export function Conversation({ agent }: ConversationProps) {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(
    () =>
      typeof window === "undefined"
        ? undefined
        : localStorage.getItem("selectedMicId") || undefined
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (selectedDeviceId)
      localStorage.setItem("selectedMicId", selectedDeviceId);
    else localStorage.removeItem("selectedMicId");
  }, [selectedDeviceId]);

  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (m) => console.log("Message:", m),
    onError: (e) => console.error("Error:", e),
    overrides: {
      agent: {
        prompt: {
          prompt: `The user wants to speak to ${
            agent.instructions
          }. You have already introduced yourself as ${
            agent.voiceSampleInstructions ?? ""
          } so keep the intro short. Start by providing a couple well thought out suggestions for where this conversation can go.`,
        },
      },
      tts: { voiceId: agent.voiceId },
    },
  });

  const ensureMicForDevice = useCallback(async (deviceId?: string) => {
    return navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        ...MIC_CONSTRAINTS,
      },
    });
  }, []);

  // ---- IMAGE TOGGLE STATE ----
  const isConnected = conversation.status === "connected";

  const getSignedUrl = async (): Promise<string> => {
    const res = await fetch("/api/get-signed-url");
    if (!res.ok)
      throw new Error(
        `Failed to get signed url: ${res.status} ${res.statusText}`
      );
    const { signedUrl } = await res.json();
    return signedUrl;
  };

  const startConversation = useCallback(async () => {
    let micStream: MediaStream | null = null;
    try {
      micStream = await ensureMicForDevice(selectedDeviceId);
      const signedUrl = await getSignedUrl();
      await conversation.startSession({
        signedUrl,
        connectionType: "websocket",
        inputDeviceId: selectedDeviceId,
        constraints: {
          audio: {
            deviceId: selectedDeviceId
              ? { exact: selectedDeviceId }
              : undefined,
            ...MIC_CONSTRAINTS,
          },
        },
        mediaStream: micStream,
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      micStream?.getTracks().forEach((t) => t.stop());
    }
  }, [conversation, selectedDeviceId, ensureMicForDevice]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="flex flex-col items-center gap-4">
      <DeviceSelectButton
        selectedId={selectedDeviceId}
        onSelect={setSelectedDeviceId}
        disabled={isConnected}
      />

      <div>
        <Image
          src={"/off-call-phone.png"}
          alt="phone"
          width={100}
          height={100}
          priority
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant="custom"
          onClick={startConversation}
          disabled={isConnected}
          className="px-4 py-2 text-white rounded disabled:bg-gray-300 bg-primary"
        >
          Start Conversation
        </Button>
        <Button
          variant="custom"
          onClick={stopConversation}
          disabled={!isConnected}
          className="px-4 py-2 bg-red-500 text-white disabled:bg-gray-300"
        >
          Stop Conversation
        </Button>
      </div>

      <div className="flex flex-col items-center">
        <p>Status: {conversation.status}</p>
        {isConnected && (
          <p>Agent is {conversation.isSpeaking ? "speaking" : "listening"}</p>
        )}
      </div>
    </div>
  );
}
