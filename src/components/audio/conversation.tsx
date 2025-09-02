"use client";

import Image from "next/image";
import { AgentProps } from "@/app/agent/[id]/page";
import { useConversation } from "@elevenlabs/react";
import { useCallback } from "react";
import { Button } from "../ui/button";

type ConversationProps = { agent: AgentProps };

const MIC_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

export function Conversation({ agent }: ConversationProps) {
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
          }. You have already introduced yourself as "${
            agent.voiceSampleInstructions ?? ""
          }" so keep the intro short. Start with one suggestion for a specific topic then pass it on to the user. Be strictly concise and straight to the point. No long sentences allowed. Do NOT over explain under any circumstances.`,
        },
      },
      tts: { voiceId: agent.voiceId },
    },
  });

  const getMic = useCallback(async () => {
    return navigator.mediaDevices.getUserMedia({
      audio: { ...MIC_CONSTRAINTS },
    });
  }, []);

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
      micStream = await getMic();
      console.log(
        "IR: checking micStream",
        micStream.getAudioTracks()[0].getSettings()
      );
      const signedUrl = await getSignedUrl();
      await conversation.startSession({
        signedUrl,
        connectionType: "websocket",
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      micStream?.getTracks().forEach((t) => t.stop());
    }
  }, [conversation, getMic]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="flex flex-col items-center *:font-medium">
      <div className="flex flex-col items-center  mb-4">
        {isConnected ? (
          <p>Agent is {conversation.isSpeaking ? "speaking" : "listening"}.</p>
        ) : (
          <p>Agent is not here yet.</p>
        )}
      </div>
      <div>
        <Image
          src={"/off-call-phone.png"}
          alt="phone"
          width={100}
          height={100}
          priority
        />
      </div>
      <p className="underline underline-offset-3 mb-4">
        Status: {conversation.status}
      </p>

      <div className="flex gap-2">
        <Button
          variant="custom"
          onClick={startConversation}
          disabled={isConnected}
          className="px-4 py-2 text-white rounded disabled:bg-gray-300 bg-black"
        >
          Start Call
        </Button>
        <Button
          variant="custom"
          onClick={stopConversation}
          disabled={!isConnected}
          className="px-4 py-2 bg-red-500 text-white disabled:bg-gray-300"
        >
          Stop Call
        </Button>
      </div>
    </div>
  );
}
