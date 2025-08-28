"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"; // Adjust path if needed
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { generateSampleAudio } from "@/lib/elevenlabs/elevenlabs-actions";
import { buffer } from "stream/consumers";

export default function TestingAudio() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePlay = async () => {
    setLoading(true);

    try {
      const base64 = await generateSampleAudio(
        "21m00Tcm4TlvDq8ikWAM",
        "Hey what is up?"
      );
      const binary = atob(base64.toString());
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      new Audio(url).play();
    } catch (err) {
      console.error("Failed to play audio:", err);
    }

    setLoading(false);
  };

  return (
    <div>
      <Button onClick={handlePlay} disabled={loading}>
        {loading ? "Loading..." : "Play Audio"}
      </Button>
      {audioUrl && <audio src={audioUrl} controls className="mt-4" />}
    </div>
  );
}
