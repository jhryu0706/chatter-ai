import { ElevenLabsClient, play } from "@elevenlabs/elevenlabs-js";

export default async function AgentVoiceSample() {
  const elevenlabs = new ElevenLabsClient();

  const voices = await elevenlabs.voices.getAll();
  return (
    <div>
      <div className="grid gap-4">
        {voices.voices.map((voice) => (
          <div key={voice.voiceId} className="p-4">
            <h2 className="font-bold">
              {voice.name} | {voice.voiceId}
            </h2>
            {voice.description && <p>{voice.description}</p>}
            {voice.previewUrl && (
              <audio controls src={voice.previewUrl} className="mt-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
