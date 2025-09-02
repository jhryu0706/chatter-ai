"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createNewAgent } from "@/lib/actions/agent-actions";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

export default function AgentForm() {
  const [state, formAction, isPending] = useActionState(createNewAgent, {});
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <>
      <form
        action={formAction}
        className="w-2/3 flex items-center rounded-xl border border-input bg-background shadow-sm p-2"
      >
        <Input
          name="instructions"
          placeholder="Type anything"
          className="flex-1 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button className="font-bold bg-black" disabled={isPending}>
          Generate
        </Button>
      </form>
      {state.message || state.error ? <div>{JSON.stringify(state)}</div> : null}
    </>
  );
}
