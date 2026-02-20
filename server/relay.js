#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — server/relay.js — Online Co-op WebSocket Relay
//                                  + AI Dialogue HTTP Proxy
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
//  HTTP endpoints (port+1, e.g. 8766 when WS is on 8765):
//    POST /ai-dialogue   { archetypeKey, encounterCount }
//      → { text: '<AI-generated line>' }  on success
//      → { error: '<message>' }           on failure / unconfigured
//
//  Rooms are ephemeral: destroyed when last player leaves.
//  No data is stored; the relay only forwards messages between room peers.
//
//  AI dialogue requires one of:
//    OPENAI_API_KEY    — uses gpt-4o-mini
//    ANTHROPIC_API_KEY — uses claude-3-haiku-20240307
//  If neither is set the endpoint returns { error: 'unconfigured' }.
//
//  To deploy:
//    npm install ws       (ws@8 or later)
//    node server/relay.js 8765
//
//  For production: run behind nginx reverse-proxy with SSL termination.
// ═══════════════════════════════════════════════════════════════════════

'use strict';

const http  = require('node:http');
const https = require('node:https');

// Use dynamic import in ESM context or CommonJS require
let WebSocketServer;
try {
  // CommonJS path (Node.js default for scripts without "type":"module")
  ({ WebSocketServer } = require('ws'));
} catch (_e) {
  console.error('[Relay] ws package not found. Run: npm install ws');
  process.exit(1);
}

const PORT      = parseInt(process.argv[2] || process.env.PORT || '8765', 10);
const HTTP_PORT = PORT + 1;
const ROOMS     = new Map(); // roomId → { p1: ws|null, p2: ws|null }

// ── AI Dialogue proxy ─────────────────────────────────────────────────────

const AI_SYSTEM_PROMPT =
  'You are a Jungian archetype in a consciousness-exploration game called GLITCH·PEACE. ' +
  'Speak in short, evocative sentences (1-2 sentences maximum). ' +
  'Be poetic, compassionate, and psychologically insightful. ' +
  'Do not break character. Do not mention game mechanics. ' +
  'Address the player directly ("you"). ' +
  'Keep the tone therapeutic and affirming of the player\'s sovereignty and wholeness.';

const ARCHETYPE_CONTEXT = {
  dragon:    'You are the Dragon archetype — ancient, powerful, a guardian of thresholds and hidden strength.',
  child:     'You are the Divine Child archetype — curious, innocent, seeing beyond what adults have forgotten.',
  orb:       'You are the Orb archetype — formless, liminal, existing between worlds and states of being.',
  captor:    'You are the Captor archetype — the part that creates loops and patterns, a teacher in disguise.',
  protector: 'You are the Protector archetype — vigilant, fierce in love, the guardian of what is most vulnerable.',
};

function _callOpenAI(userPrompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 80,
      messages: [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        { role: 'user',   content: userPrompt },
      ],
    });
    const req = https.request({
      hostname: 'api.openai.com',
      path:     '/v1/chat/completions',
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Authorization':  `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => {
        try {
          const data = JSON.parse(raw);
          if (data.error) return reject(new Error(data.error.message));
          resolve(data.choices[0].message.content.trim());
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function _callClaude(userPrompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 80,
      system: AI_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const req = https.request({
      hostname: 'api.anthropic.com',
      path:     '/v1/messages',
      method:   'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length':    Buffer.byteLength(body),
      },
    }, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => {
        try {
          const data = JSON.parse(raw);
          if (data.error) return reject(new Error(data.error.message));
          resolve(data.content[0].text.trim());
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function generateArchetypeDialogue(archetypeKey, encounterCount) {
  const ctx    = ARCHETYPE_CONTEXT[archetypeKey] || ARCHETYPE_CONTEXT.dragon;
  const prompt = `${ctx}\n\nThis is encounter #${encounterCount + 1} with the player. ` +
    'Speak one or two sentences to greet them — acknowledging their progress, ' +
    'reflecting on what this encounter means, and offering a brief insight or challenge.';

  if (process.env.OPENAI_API_KEY)    return _callOpenAI(prompt);
  if (process.env.ANTHROPIC_API_KEY) return _callClaude(prompt);
  return null; // neither key configured — caller should use static fallback
}

// ── HTTP server for AI dialogue (runs on HTTP_PORT = PORT+1) ─────────────

const httpServer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'POST' && req.url === '/ai-dialogue') {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', async () => {
      let archetypeKey = 'dragon', encounterCount = 0;
      try {
        const parsed = JSON.parse(body);
        archetypeKey   = (parsed.archetypeKey   || 'dragon').toLowerCase();
        encounterCount = parseInt(parsed.encounterCount || 0, 10);
      } catch (_e) { /* use defaults */ }

      try {
        const text = await generateArchetypeDialogue(archetypeKey, encounterCount);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(text ? { text } : { error: 'unconfigured' }));
      } catch (err) {
        console.warn('[AI dialogue] error:', err.message);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

httpServer.listen(HTTP_PORT, () => {
  console.log(`[GLITCH·PEACE AI Relay] HTTP on http://0.0.0.0:${HTTP_PORT}`);
  console.log(`[AI Relay] POST /ai-dialogue { archetypeKey, encounterCount } => { text }`);
  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY)
    console.log('[AI Relay] Set OPENAI_API_KEY or ANTHROPIC_API_KEY to enable AI dialogue.');
});

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
