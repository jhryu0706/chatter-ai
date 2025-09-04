"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAgent } from "@/lib/ctx/agent-context";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function AgentAudioSample() {
  const agent = useAgent();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePlay = async () => {
    setLoading(true);

    try {
      let sample: string | null = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        sample = agent.voiceSampleURL;
        if (!sample && attempt < 3) {
          await sleep(3000);
        }
      }

      if (!sample) {
        throw new Error(
          "Sample is being generated, please try again in a few."
        );
      }

      setAudioUrl(sample);
      const audioElement = new Audio(audioUrl!);
      audioElement.play();
    } catch (err) {
      console.error("Failed to play audio:", err);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center">
      {!audioUrl && (
        <div className="space-y-4">
          <Button
            className="text-lg"
            variant="link"
            onClick={handlePlay}
            disabled={loading}
          >
            {loading ? "Loading..." : "Generate Sample"}
          </Button>
        </div>
      )}
      {audioUrl && (
        <div className="w-full max-w-sm">
          <dt className="font-medium">Hello from Agent:</dt>
          <audio
            className="justify-center mt-2 w-full"
            src={audioUrl}
            controls
          />
        </div>
      )}
    </div>
  );
}
