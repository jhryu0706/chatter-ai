"use client";

import { useAgentContext } from "@/lib/ctx/agent-context";
import { cn, Conversation, formatDuration, formatTime } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { useCallback, useState } from "react";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { getConversationsForAgent } from "@/lib/actions/agent-actions";
import { Button } from "../ui/button";

function Row({ conv, index }: { conv: Conversation; index: number }) {
  return (
    <div className="p-3 hover:bg-sidebar-accent rounded-sm">
      <div className="flex items-start justify-between">
        <div>{index + 1}.</div>
        <div className="min-w-0">
          <div className="font-medium truncate">
            {formatTime(conv.startTimeUNIX)}
          </div>
          <div className="text-xs">{conv.id}</div>
        </div>
        <Badge variant="outline" className="shrink-0">
          {formatDuration(conv.durationSeconds)}
        </Badge>
      </div>
    </div>
  );
}

export default function ConversationList({
  conversations,
  emptyState,
}: {
  conversations: Conversation[];
  emptyState?: React.ReactNode;
}) {
  const { agent } = useAgentContext();

  // local list seeded from props
  const [list, setList] = useState<Conversation[]>(conversations);
  const [loading, setLoading] = useState(false);

  const refreshList = useCallback(async () => {
    if (!agent) return;
    setLoading(true);
    try {
      const res = await getConversationsForAgent(agent.id);
      setList(res);
    } catch (e) {
      console.error("[ConversationList] refresh failed", e);
    } finally {
      setLoading(false);
    }
  }, [agent]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center *:font-medium">
      <div className="w-full h-full flex flex-col">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center w-full justify-between ">
            <span>Count: {list.length}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={refreshList}
              disabled={loading || !agent}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </Button>
          </div>
        </div>
        <Separator />
        <ScrollArea className="h-[min(64vh,600px)] w-full py-3">
          <div className="grid gap-3">
            {list.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-10">
                {emptyState ?? "No conversations yet."}
              </div>
            )}
            {list.map((c, index) => (
              <Row key={c.id} conv={c} index={index} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
