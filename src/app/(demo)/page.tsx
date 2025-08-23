import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db } from "@/db";
import { agents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { useState } from "react";

export default async function Page() {
  return (
    <div>
      <Card className="w-full border-0 p-12 flex flex-col items-center justify-center text-center shadow-none">
        <CardTitle className="text-xl">Create an Agent</CardTitle>
        <div className="w-2/3 flex items-center rounded-xl border border-input bg-background shadow-sm p-2">
          <Input
            type="text"
            placeholder="Type anything"
            className="flex-1 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button>Generate</Button>
        </div>
      </Card>
    </div>
  );
}
