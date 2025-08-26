"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Form } from "../ui/form";
import { deleteAgent, updateAgentName } from "@/lib/actions/agent-actions";
import { useRouter } from "next/navigation";

interface AgentButtonGroupProps {
  agentId: string;
}

export default function AgentButtonGroup({ agentId }: AgentButtonGroupProps) {
  const [open, setOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(updateAgentName, {});
  const [delState, delFormAction, delPending] = useActionState(deleteAgent, {});
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (state?.message) {
        alert(state.message);
      } else if (state?.error) {
        alert(state.error);
      }
      router.refresh();
    }, 150);
    return () => clearTimeout(timeout);
  }, [state]);

  return (
    <div role="group" className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">Edit</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="leading-none font-medium">Edit Agent</h4>
              <p className="text-muted-foreground text-sm">
                Update agent name.
              </p>
            </div>
            <form
              action={async (formData) => {
                setOpen(false);
                formAction(formData);
              }}
              className="space-y-2"
            >
              <Input type="hidden" name="agentId" value={agentId} />
              <Input
                name="newName"
                className="flex-1 border-1 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <button
                type="submit"
                className="w-full border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
              >
                Submit
              </button>
            </form>
          </div>
        </PopoverContent>
      </Popover>
      <Popover open={delOpen} onOpenChange={setDelOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">Delete</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="grid gap-4">
            <form
              action={async (formData) => {
                setDelOpen(false);
                delFormAction(formData);
              }}
              className="space-y-2"
            >
              <Input type="hidden" name="agentId" value={agentId} />
              <button
                type="submit"
                className="w-full border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
              >
                Confirm Delete
              </button>
            </form>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
