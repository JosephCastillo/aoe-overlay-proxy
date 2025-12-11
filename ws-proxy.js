import { WebSocketServer } from "ws";
import { WebSocket } from "ws";

export const config = {
  runtime: "edge"
};

export default async (req) => {
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("Expected websocket", { status: 400 });
  }

  const [client, server] = Object.values(new WebSocketServer({ noServer: true }).handleUpgrade(req));

  // Conectar desde tu proxy al WebSocket real de aoe2recs
  const target = new WebSocket("wss://aoe2recs.com/api");

  // Relay: client <-> target
  client.onmessage = (msg) => target.send(msg.data);
  target.onmessage = (msg) => client.send(msg.data);

  client.onclose = () => target.close();
  target.onclose = () => client.close();

  return new Response(null, {
    status: 101,
    webSocket: server
  });
};
