#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — server/relay.js — Online Co-op WebSocket Relay
//
//  Minimal peer-relay server for 2-player online co-op.
//  Usage:
//    node server/relay.js [port]    (default port: 8765)
//
//  Protocol (JSON messages over WebSocket):
//    Client → Server:
//      { type: 'join',   roomId: '<6-char code>' }   — join or create room
//      { type: 'input',  data: { key, dy, dx } }     — relay player input
//      { type: 'state',  data: { ... } }             — relay game state
//      { type: 'ping' }                              — keep-alive
//
//    Server → Client:
//      { type: 'joined',  role: 'p1'|'p2', roomId }  — assigned role
//      { type: 'peer_joined' }                        — other player entered
//      { type: 'peer_left' }                          — other player left
//      { type: 'relay',  from: 'p1'|'p2', data: {...} } — relayed message
//      { type: 'error',  message: '<text>' }
//      { type: 'pong' }
//
//  Rooms are ephemeral: destroyed when last player leaves.
//  No data is stored; the relay only forwards messages between room peers.
//
//  To deploy:
//    npm install ws       (ws@8 or later)
//    node server/relay.js 8765
//
//  For production: run behind nginx reverse-proxy with SSL termination.
// ═══════════════════════════════════════════════════════════════════════

'use strict';

// Use dynamic import in ESM context or CommonJS require
let WebSocketServer;
try {
  // CommonJS path (Node.js default for scripts without "type":"module")
  ({ WebSocketServer } = require('ws'));
} catch (_e) {
  console.error('[Relay] ws package not found. Run: npm install ws');
  process.exit(1);
}

const PORT   = parseInt(process.argv[2] || process.env.PORT || '8765', 10);
const ROOMS  = new Map(); // roomId → { p1: ws|null, p2: ws|null }

const wss = new WebSocketServer({ port: PORT });

function _send(ws, obj) {
  try { if (ws.readyState === 1 /* WebSocket.OPEN */) ws.send(JSON.stringify(obj)); } catch (_e) {}
}

function _getOrCreateRoom(roomId) {
  if (!ROOMS.has(roomId)) ROOMS.set(roomId, { p1: null, p2: null });
  return ROOMS.get(roomId);
}

function _cleanRoom(roomId) {
  const room = ROOMS.get(roomId);
  if (!room) return;
  if (!room.p1 && !room.p2) ROOMS.delete(roomId);
}

wss.on('connection', (ws) => {
  ws._roomId = null;
  ws._role   = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch (_e) { return; }

    switch (msg.type) {
      case 'join': {
        const roomId = (msg.roomId || '').toUpperCase().slice(0, 8);
        if (!roomId) { _send(ws, { type: 'error', message: 'roomId required' }); return; }
        const room = _getOrCreateRoom(roomId);

        let role;
        if      (!room.p1) { room.p1 = ws; role = 'p1'; }
        else if (!room.p2) { room.p2 = ws; role = 'p2'; }
        else {
          _send(ws, { type: 'error', message: 'room full' });
          return;
        }
        ws._roomId = roomId;
        ws._role   = role;
        _send(ws, { type: 'joined', role, roomId });

        // Notify the other peer
        const peer = role === 'p1' ? room.p2 : room.p1;
        if (peer) {
          _send(peer, { type: 'peer_joined' });
          _send(ws,   { type: 'peer_joined' }); // room was already occupied
        }
        console.log(`[Room ${roomId}] ${role} joined. Players: ${room.p1?'P1':'  '} ${room.p2?'P2':'  '}`);
        break;
      }

      case 'input':
      case 'state': {
        const { _roomId, _role } = ws;
        if (!_roomId || !_role) return;
        const room = ROOMS.get(_roomId);
        if (!room) return;
        const peer = _role === 'p1' ? room.p2 : room.p1;
        if (peer) _send(peer, { type: 'relay', from: _role, data: msg.data });
        break;
      }

      case 'ping': {
        _send(ws, { type: 'pong' });
        break;
      }
    }
  });

  ws.on('close', () => {
    const { _roomId, _role } = ws;
    if (!_roomId) return;
    const room = ROOMS.get(_roomId);
    if (!room) return;
    const peer = _role === 'p1' ? room.p2 : room.p1;
    if (_role === 'p1') room.p1 = null;
    if (_role === 'p2') room.p2 = null;
    _cleanRoom(_roomId);
    if (peer) _send(peer, { type: 'peer_left' });
    console.log(`[Room ${_roomId}] ${_role} left. Rooms active: ${ROOMS.size}`);
  });

  ws.on('error', (err) => {
    console.warn('[WS] error:', err.message);
  });
});

console.log(`[GLITCH·PEACE Relay] listening on ws://0.0.0.0:${PORT}`);
console.log('[Relay] Protocol: join(roomId) → relay inputs & state between two peers');
