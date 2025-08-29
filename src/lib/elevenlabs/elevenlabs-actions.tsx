"use server";

import { db } from "@/db";
import { voices } from "@/db/schema";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function fetchSampleAudio(
  voiceId: string,
  text: string
): Promise<String> {
  const stream = await elevenlabs.textToSpeech.convert(voiceId, {
    text,
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128",
  });

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  let result = await reader.read();
  while (!result.done) {
    chunks.push(new Uint8Array(result.value));
    result = await reader.read();
  }

  const buffer = Buffer.concat(chunks);
  const base64 = buffer.toString("base64");

  const audioURL = `data:audio/mpeg;base64,${base64}`;
  return audioURL;
}

export async function fetchAllVoices() {
  return elevenlabs.voices.getAll();
}

// call this when you need to refresh voices
// export async function uploadVoices() {
//   const allVoices = fetchAllVoices();
//   const formattedVocies = (await allVoices).voices.map((voice, index) => ({
//     id: voice.voiceId.toString(),
//     name: voice.name?.toString(),
//     description: voice.description?.toString(),
//     orderNumber: index,
//   }));
//   let result;
//   try {
//     result = await db
//       .insert(voices)
//       .values(formattedVocies)
//       .onConflictDoNothing();
//   } catch (err) {
//     return err;
//   }
//   return result;
// }
