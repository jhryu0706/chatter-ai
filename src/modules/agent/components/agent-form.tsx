"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createNewAgent } from "@/lib/actions/agent-actions";
import { useUserID } from "@/lib/ctx/user-context";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

export default function AgentForm() {
  const [state, formAction, isPending] = useActionState(createNewAgent, {});
  const userId = useUserID();
  const router = useRouter();
  const didNavigateRef = useRef(false);

  useEffect(() => {
    if (!state) return;

    const msg = state.message?.toString().trim();

    if (!msg) {
      router.refresh();
      return;
    }

    if (didNavigateRef.current) return;

    const timer = setTimeout(() => {
      didNavigateRef.current = true;
      router.push(`/agent/${encodeURIComponent(msg)}`);
    }, 1000);

    return () => clearTimeout(timer);
  }, [state, router]);

  return (
    <>
      {!state.message ? (
        <form
          action={formAction}
          className="fixed inset-x-0 bottom-0 z-50 w-full
    p-2 pt-2 pb-[max(env(safe-area-inset-bottom),0.5rem)]
    bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
    border-t border-input
    flex items-center rounded-none  

    md:static md:inset-auto md:z-auto
    md:w-2/3 md:mx-0 md:p-2 md:bg-background md:backdrop-blur-0 md:border md:rounded-xl md:shadow-sm
  "
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
      ) : (
        <div>
          Taking you to agent page
          <span className="inline-flex">
            <span className="dot ml-0.5">.</span>
            <span className="dot" style={{ animationDelay: "120ms" }}>
              .
            </span>
            <span className="dot" style={{ animationDelay: "240ms" }}>
              .
            </span>
          </span>
          <span className="sr-only">Loading</span>
          <style jsx>{`
            .dot {
              animation: dotPulse 0.9s ease-in-out infinite;
              display: inline-block;
              transform-origin: center;
              opacity: 0.2;
            }
            @keyframes dotPulse {
              0%,
              100% {
                transform: translateY(0);
                opacity: 0.2;
              }
              50% {
                transform: translateY(-0.2em);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
