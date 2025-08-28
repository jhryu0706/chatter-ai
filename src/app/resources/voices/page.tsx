import VoiceLibrary from "@/components/agent/voice-library";
import { SetBreadcrumb } from "@/components/home/breadcrumb-context";
import { uploadVoices } from "@/lib/elevenlabs/elevenlabs-actions";

export default function Page() {
  return (
    <>
      <SetBreadcrumb label="Voices" href="/resources/voices" />
      <div className="flex items-center space-x-2" role="group">
        <h1 className="text-4xl font-bold">Hi!</h1>
      </div>
      <p className="text-muted-foreground text-xl">
        Say hello to our voice actors:
      </p>
      <VoiceLibrary />
    </>
  );
}
