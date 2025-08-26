import { NextResponse } from "next/server";
import { inngest } from "../../../inngest/client"; // Import our client

// Opt out of caching; every request should send a new event
export const dynamic = "force-dynamic";

// Create a simple async Next.js API route handler
export async function GET() {
  // Send your event payload to Inngest
  const response = await inngest.send({
    name: "ai/generate.agent.name",
    data: {
      "description": "You are a acting coach for a movie for hollywood that specializes in the brooklyn accent."
    }
})

  return NextResponse.json(response)
}