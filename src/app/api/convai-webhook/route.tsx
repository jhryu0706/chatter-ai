import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";
import { transcriptInsertSchema } from "@/db/validation";
import { db } from "@/db";
import { conversation } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  PostCallAudioEvent,
  PostCallTranscriptionEvent,
  WebhookEvent,
} from "@/lib/utils";

export async function GET() {
  return NextResponse.json({ status: "webhook listening" }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const secret = process.env.ELEVENLABS_CONVAI_WEBHOOK_SECRET;
  const { event, error } = await constructWebhookEvent(req, secret);
  if (error) {
    return NextResponse.json({ error: error }, { status: 401 });
  }

  if (!event) {
    return NextResponse.json({ error: "No event received." }, { status: 404 });
  }

  if (event.type === "post_call_transcription") {
    console.log("transcript event data", JSON.stringify(event, null, 2));
    await handleTranscript(event);
  } else if (event.type === "post_call_audio") {
    console.log("audio event data", JSON.stringify(event, null, 2));
    try {
      await handleAudio(event);
    } catch (err) {
      console.log(err);
    }
  } else {
    return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
  }
  return NextResponse.json({ received: true }, { status: 200 });
}

const constructWebhookEvent = async (req: NextRequest, secret?: string) => {
  const body = await req.text();
  const signature_header = req.headers.get("ElevenLabs-Signature");

  console.log("Recieved signature header: ", signature_header);

  if (!signature_header) {
    return { event: null, error: "Missing signature header" };
  }

  const headers = signature_header.split(",");
  const timestamp = headers.find((e) => e.startsWith("t="))?.substring(2);
  const signature = headers.find((e) => e.startsWith("v0="));

  if (!timestamp || !signature) {
    return { event: null, error: "Invalid signature format" };
  }

  // Validate timestamp
  const reqTimestamp = Number(timestamp) * 1000;
  const tolerance = Date.now() - 30 * 60 * 1000;
  if (reqTimestamp < tolerance) {
    return { event: null, error: "Request expired" };
  }

  // Validate hash
  const message = `${timestamp}.${body}`;

  if (!secret) {
    return { event: null, error: "Webhook secret not configured" };
  }

  const digest =
    "v0=" + crypto.createHmac("sha256", secret).update(message).digest("hex");
  console.log({ digest, signature });
  if (signature !== digest) {
    return { event: null, error: "Invalid signature" };
  }

  const event = JSON.parse(body) as WebhookEvent;
  return { event, error: null };
};

async function handleTranscript(event: PostCallTranscriptionEvent) {
  const conversationId = event.data.conversation_id;
  const startTimeUNIX = event.event_timestamp;
  const durationSeconds = event.data.metadata.call_duration_secs;
  const summary = event.data.analysis.transcript_summary;
  const rawTranscript = event.data.transcript;

  const result = transcriptInsertSchema.safeParse({
    id: conversationId,
    startTimeUNIX,
    durationSeconds,
    summary,
    rawTranscript,
  });

  if (!result.success) {
    console.log("Failed to save transcript due to this error: ", result.error);
    return;
  }

  try {
    await db
      .update(conversation)
      .set({
        startTimeUNIX,
        durationSeconds,
        summary,
        transcript: rawTranscript,
      })
      .where(eq(conversation.id, conversationId));
  } catch (err) {
    console.error("Failed to save transcript due to this error: ", err);
    return;
  }
  return;
}

async function handleAudio(event: PostCallAudioEvent) {
  console.log("IR: handling audio", event.data);
  const conversationId = event.data.conversation_id;
  try {
    const updated = await db
      .update(conversation)
      .set({
        recording: event.data.full_audio,
      })
      .where(eq(conversation.id, conversationId))
      .returning({ id: conversation.id });
    if (updated.length === 0) {
      console.error("[audio] No conversation found for ID:", conversationId);
    }
  } catch (err) {
    console.error("[audio] DB error:", err);
    throw err;
  }
}
