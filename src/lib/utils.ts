import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const NUMBER_OF_AGENTS = 22

export type PostCallAudioEvent = {
  type: "post_call_audio";
  event_timestamp: number;
  data: {
    agent_id: string;
    conversation_id: string;
    full_audio: string; // base64-encoded MP3
  };
};

export interface PostCallTranscriptionEvent {
  type: "post_call_transcription";
  event_timestamp: number;
  data: {
    agent_id: string;
    conversation_id: string;
    status: string;
    user_id: string;
    transcript: {
      role: "agent" | "user";
      message: string;
      tool_calls: unknown;
      tool_results: unknown;
      feedback: unknown;
      time_in_call_secs: number;
      conversation_turn_metrics: {
        convai_llm_service_ttfb?: { elapsed_time: number };
        convai_llm_service_ttf_sentence?: { elapsed_time: number };
      } | null;
    }[];
    metadata: {
      start_time_unix_secs: number;
      call_duration_secs: number;
      cost: number;
      deletion_settings: {
        deletion_time_unix_secs: number;
        deleted_logs_at_time_unix_secs: number | null;
        deleted_audio_at_time_unix_secs: number | null;
        deleted_transcript_at_time_unix_secs: number | null;
        delete_transcript_and_pii: boolean;
        delete_audio: boolean;
      };
      feedback: {
        overall_score: number | null;
        likes: number;
        dislikes: number;
      };
      authorization_method: string;
      charging: {
        dev_discount: boolean;
      };
      termination_reason: string;
    };
    analysis: {
      evaluation_criteria_results: Record<string, unknown>;
      data_collection_results: Record<string, unknown>;
      call_successful: string;
      transcript_summary: string;
    };
    conversation_initiation_client_data: {
      conversation_config_override: {
        agent: {
          prompt: string | null;
          first_message: string | null;
          language: string;
        };
        tts: {
          voice_id: string | null;
        };
      };
      custom_llm_extra_body: Record<string, unknown>;
      dynamic_variables: {
        user_name: string;
      };
    };
  };
}

export type WebhookEvent = PostCallAudioEvent | PostCallTranscriptionEvent;

export type TranscriptTurn = {
  role: "agent" | "user";
  message: string;
  tool_calls: unknown;
  tool_results: unknown;
  feedback: unknown;
  time_in_call_secs: number;
  conversation_turn_metrics: {
    convai_llm_service_ttfb?: { elapsed_time: number };
    convai_llm_service_ttf_sentence?: { elapsed_time: number };
  } | null;
};

export type Conversation = {
  id: string;
  startTimeUNIX: number; 
  durationSeconds: number;
  summary?: string | null;
};

export function toDate(ts: number) {
  // accept seconds or milliseconds
  return new Date(ts < 2_000_000_000 ? ts * 1000 : ts);
}


export function formatTime(ts: number) {
  const d = toDate(ts);
  // e.g., Sep 4, 2025 · 3:17 PM
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}


export function formatDuration(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}