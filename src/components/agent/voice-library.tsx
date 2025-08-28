import { fetchAllVoices } from "@/lib/elevenlabs/elevenlabs-actions";

export default async function VoiceLibrary() {
  const voices = await fetchAllVoices();
  return (
    <div>
      <div className="grid gap-4">
        {voices.voices.map((voice, index) => (
          <div
            key={voice.voiceId}
            className={`py-4 w-2/3 ${index !== 0 ? "border-t-2" : ""}`}
          >
            <h2 className="font-bold">{voice.name}</h2>
            <p className="text-muted-foreground">ID: {voice.voiceId}</p>
            {voice.description && (
              <p className="text-muted-foreground">{voice.description}</p>
            )}
            {voice.previewUrl && (
              <audio controls src={voice.previewUrl} className="mt-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
