"use client";

import { AgentProps } from "@/app/agent/[id]/page";
import { useConversation } from "@elevenlabs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DeviceSelectButton } from "./device-selection-button";

type ConversationProps = { agent: AgentProps };

function generateCustomPrompt(instructions: string, intro: string): string {
  return (
    `The user wants to speak to ${instructions}. You have already introduced yourself as ${intro} so keep the intro short.` +
    `If the user is looking for support on a specific topic, immediately provide an option for where the conversation can go, or ask if they want to take the lead.` +
    `Otherwise, if the user is looking to speak to a character, assume the user wants banter and start with an enaging opening line. Make sure the opener grabs attention,` +
    `bonus points if it leads to engagement with a question at the end.`
  );
}

const getSignedUrl = async (): Promise<string> => {
  const res = await fetch("/api/get-signed-url");
  if (!res.ok)
    throw new Error(
      `Failed to get signed url: ${res.status} ${res.statusText}`
    );
  const { signedUrl } = await res.json();
  return signedUrl;
};

// Reusable capture constraints for cleaner voice calls
const MIC_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

export function Conversation({ agent }: ConversationProps) {
  // --- Mic device selection (persisted) ---
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(
    () => {
      if (typeof window === "undefined") return undefined;
      return localStorage.getItem("selectedMicId") || undefined;
    }
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (selectedDeviceId)
      localStorage.setItem("selectedMicId", selectedDeviceId);
    else localStorage.removeItem("selectedMicId");
  }, [selectedDeviceId]);

  // --- ElevenLabs conversation hook ---
  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (m) => console.log("Message:", m),
    onError: (e) => console.error("Error:", e),
    overrides: {
      agent: {
        prompt: {
          prompt: generateCustomPrompt(
            agent.instructions,
            agent.voiceSampleInstructions!
          ),
        },
      },
      tts: {
        voiceId: agent.voiceId,
      },
    },
  });

  // Pre-warm mic permission for the chosen device; returns a stream you can optionally pass through
  const ensureMicForDevice = useCallback(async (deviceId?: string) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        ...MIC_CONSTRAINTS,
      },
    });
    return stream;
  }, []);

  const startConversation = useCallback(async () => {
    try {
      // 1) Make sure we have permission + the chosen device is available
      const micStream = await ensureMicForDevice(selectedDeviceId);

      // 2) Get session URL
      const signedUrl = await getSignedUrl();

      // 3) Start ElevenLabs session
      // Some SDK builds accept extra audio options; we pass them in a narrow-typed way.
      const sessionOpts: any = {
        signedUrl,
        connectionType: "websocket",
        // If supported by your @elevenlabs/react build, these often work:
        inputDeviceId: selectedDeviceId, // preferred
        constraints: {
          audio: {
            deviceId: selectedDeviceId
              ? { exact: selectedDeviceId }
              : undefined,
            ...MIC_CONSTRAINTS,
          },
        },
        mediaStream: micStream, // fallback if the SDK supports direct stream
      };

      await conversation.startSession(sessionOpts);

      // If you don't want to keep the local stream open (LED/mic indicator), stop local tracks.
      // ElevenLabs will pull from its own capture after session starts if it doesn't use mediaStream.
      micStream.getTracks().forEach((t) => t.stop());
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [conversation, selectedDeviceId, ensureMicForDevice]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isConnected = conversation.status === "connected";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Mic picker (shadcn popover) */}
      <DeviceSelectButton
        selectedId={selectedDeviceId}
        onSelect={setSelectedDeviceId}
        disabled={isConnected}
      />

      <div className="flex gap-2">
        <button
          onClick={startConversation}
          disabled={isConnected}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Start Conversation
        </button>
        <button
          onClick={stopConversation}
          disabled={!isConnected}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
        >
          Stop Conversation
        </button>
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
