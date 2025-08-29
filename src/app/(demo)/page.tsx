import { Card, CardTitle } from "@/components/ui/card";
import AgentForm from "@/modules/agent/components/agent-form";

export default async function Page() {
  return (
    <div>
      <Card className="w-full border-0 p-12 flex flex-col items-center justify-center text-center shadow-none">
        <CardTitle className="text-xl">Create an Agent</CardTitle>
        <AgentForm />
      </Card>
    </div>
  );
}
