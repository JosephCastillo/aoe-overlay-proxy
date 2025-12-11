import { WebSocket } from 'ws';

export default function handler(req, res) {
  if (req.headers.upgrade !== 'websocket') {
    return res.status(400).send('Expected websocket');
  }

  const upstream = new WebSocket('wss://aoe2recs.com/dashboard/api/');
  const { socket } = res;

  upstream.on('open', () => {
    socket.write(
      'HTTP/1.1 101 Switching Protocols\r\n' +
      'Upgrade: websocket\r\n' +
      'Connection: Upgrade\r\n' +
      '\r\n'
    );

    upstream.on('message', msg => socket.write(msg));
    socket.on('data', msg => upstream.send(msg));
  });

  upstream.on('close', () => socket.end());
  upstream.on('error', () => socket.end());
}
