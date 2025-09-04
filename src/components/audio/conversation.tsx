"use client";

import Image from "next/image";
import { useConversation } from "@elevenlabs/react";
import { useCallback } from "react";
import { Button } from "../ui/button";
import { inngest } from "@/inngest/client";
import { useUserID } from "@/lib/ctx/user-context";
import { useAgent } from "@/lib/ctx/agent-context";

const MIC_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

export function Conversation() {
  const userId = useUserID();
  const agent = useAgent();

  console.log("IR: in conversation with userId", userId);
  console.log("IR: in conversation with agent", agent);

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
          }" so no need for an intro. Start with a question to the user. Be strictly concise and straight to the point. No long sentences allowed. Do NOT over-explain unless the user explicitly asks for detail.`,
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
      const signedUrl = await getSignedUrl();
      await conversation.startSession({
        signedUrl,
        connectionType: "websocket",
      });
      const convId = conversation.getId();

      console.log("IR: sending to inngest for conv", inngest.apiBaseUrl);
      const result = await inngest.send({
        name: "conversation/created",
        data: {
          agentId: agent.id,
          conversationId: convId,
          userId,
        },
      });
      console.log("IR: result from inngest, ", result);
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
    <div className="flex flex-col items-center justify-center w-full h-full text-center *:font-medium">
      <div className="flex flex-col items-center  mb-4 ">
        {isConnected ? (
          <p>Agent is {conversation.isSpeaking ? "speaking" : "listening"}.</p>
        ) : (
          <p>Agent is not here.</p>
        )}
      </div>
      <div>
        <Image
          src={"/off-call-phone.png"}
          alt="phone"
          width={150}
          height={150}
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
