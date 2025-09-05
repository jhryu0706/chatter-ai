"use client";

import { useAgentContext } from "@/lib/ctx/agent-context";
import { Conversation, formatDuration, formatTime } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { useCallback, useState } from "react";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { getConversationsForAgent } from "@/lib/actions/agent-actions";
import { Button } from "../ui/button";

function Row({
  conv,
  index,
  isOpen,
  onToggle,
}: {
  conv: Conversation;
  index: number;
  isOpen: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => onToggle(conv.id)}
      className="hover:bg-sidebar-accent rounded-sm flex-col w-full *:text-sm p-3"
    >
      {!isOpen && (
        <div className="flex items-center justify-between">
          <div className="truncate items-center justify-between *:mr-3">
            <span>{index + 1}.</span>
            <span>{formatTime(conv.startTimeUNIX)}</span>
          </div>
          <Badge variant="outline">
            {isOpen ? "Selected" : formatDuration(conv.durationSeconds)}
          </Badge>
        </div>
      )}
      {/* Expandable audio area */}
      {isOpen && conv.audioURL && (
        <audio controls preload="none" className="w-full" src={conv.audioURL} />
      )}
    </Button>
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

  const [list, setList] = useState<Conversation[]>(conversations);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshList = useCallback(async () => {
    if (!agent) return;
    setLoading(true);
    try {
      const res = await getConversationsForAgent(agent.id);
      setList(res);
      // if the current open item no longer exists, close it
      if (openId && !res.some((c) => c.id === openId)) setOpenId(null);
    } catch (e) {
      console.error("[ConversationList] refresh failed", e);
    } finally {
      setLoading(false);
    }
  }, [agent, openId]);

  const handleToggleRow = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center w-full justify-between">
          <span className="">Click to play audio.</span>
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
            <Row
              key={c.id}
              conv={c}
              index={index}
              isOpen={openId === c.id}
              onToggle={handleToggleRow}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
