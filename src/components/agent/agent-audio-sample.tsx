"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"; // Adjust path if needed
import { fetchOneAgent } from "@/lib/actions/agent-actions";
import { play } from "@elevenlabs/elevenlabs-js";

type AgentAudioSampleProps = {
  agentId: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function AgentAudioSample({ agentId }: AgentAudioSampleProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePlay = async () => {
    setLoading(true);

    try {
      const agent = fetchOneAgent(agentId);
      let sample: string | null = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        sample = (await agent).voiceSampleURL;
        if (!sample && attempt < 3) {
          await sleep(1000);
        }
        console.log("IR: attempt no", attempt);
      }

      if (!sample) {
        throw new Error(
          "Sample is being generated, please try again in a few."
        );
      }

      setAudioUrl(sample);
      const audioElement = new Audio(audioUrl!);
      audioElement.play;
    } catch (err) {
      console.error("Failed to play audio:", err);
    }

    setLoading(false);
  };

  return (
    <div className="items-center">
      {!audioUrl && (
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Step 1:</h1>
          <Button
            size="lg"
            className="font-bold text-lg"
            onClick={handlePlay}
            disabled={loading}
          >
            {loading ? "Loading..." : "Check out sample"}
          </Button>
        </div>
      )}
      {audioUrl && (
        <>
          <h1 className="text-4xl font-bold">Sample:</h1>
          <audio src={audioUrl} controls className="mt-4" />
        </>
      )}
    </div>
  );
}
