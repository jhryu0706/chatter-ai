"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createNewAgent } from "@/lib/actions/agent-actions";
import { useUserID } from "@/lib/ctx/user-context";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

export default function AgentForm() {
  const [state, formAction, isPending] = useActionState(createNewAgent, {});
  const userId = useUserID();
  const router = useRouter();

  useEffect(() => {
    if (state == null) return;
    router.refresh();
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
        <Input type="hidden" name="userId" value={userId!} />
        <Button className="font-bold bg-black" disabled={isPending}>
          Generate
        </Button>
      </form>
      {state.message || state.error ? <div>{JSON.stringify(state)}</div> : null}
    </>
  );
}
