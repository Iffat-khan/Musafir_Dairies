import type { Response } from "express";

type Client = { res: Response; userId: string };

const clients = new Set<Client>();

export function addSseClient(userId: string, res: Response) {
  const client: Client = { userId, res };
  clients.add(client);

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  });
  res.write(`event: hello\ndata: ${JSON.stringify({ ok: true })}\n\n`);

  res.on("close", () => {
    clients.delete(client);
  });
}

export function pushAlert(userId: string, alert: any) {
  for (const c of clients) {
    if (c.userId !== userId) continue;
    c.res.write(`event: alert\ndata: ${JSON.stringify(alert)}\n\n`);
  }
}

