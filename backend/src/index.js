import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuid } from 'uuid';

dotenv.config();

const app = express();
app.use(cors({ origin: '*', methods: ['GET','POST','PATCH'], allowedHeaders: ['Content-Type'] }));
app.use(express.json());

// --- In-memory store (replace with DB in production) ---
const db = {
  users: [
    { id: 'u1', name: 'Admin', email: 'admin@gatezen.app', role: 'admin' },
    { id: 'u2', name: 'Staff', email: 'staff@gatezen.app', role: 'staff' },
    { id: 'u3', name: 'Resident', email: 'resident@gatezen.app', role: 'resident' }
  ],
  announcements: [
    { id: uuid(), title: 'Water Tank Cleaning', body: 'Scheduled on Saturday 10 AM', createdAt: new Date().toISOString(), authorId: 'u2' }
  ],
  payments: [
    { id: uuid(), userId: 'u1', description: 'Maintenance July', amount: 1500, status: 'due' }
  ],
  maintenance: [],
  bookings: [],
  visitors: [],
  documents: [{ id: uuid(), name: 'Community Rules.pdf', url: '#' }],

  // --- Communications (Announcements, Chat, Discussions) ---
  announcementComments: [], // {id, announcementId, userId, body, createdAt}
  threads: [
    { id: 't-general', type: 'group', name: 'General', members: ['u1','u2','u3'] }
  ], // {id, type:'group'|'dm', name?, members:[userId]}
  messages: [], // {id, threadId, fromUserId, body, createdAt}
  discussions: [], // {id, title, body, authorId, createdAt, locked?, tags:[]}
  discussionReplies: [] // {id, discussionId, authorId, body, createdAt}
};

// --- SSE client registry ---
const sseClients = new Set();

// --- Helpers ---
const nowISO = () => new Date().toISOString();
function broadcast(event, payload) {
  const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach((res) => res.write(data));
}
const requireRole = (roles) => (req, res, next) => {
  const email =
    (req.body && req.body.email) ||
    (req.query && req.query.email) ||
    (req.headers && req.headers['x-user-email']);
  const u = db.users.find((x) => x.email === email);
  if (!u || !roles.includes(u.role)) return res.status(403).json({ error: 'Forbidden' });
  req.user = u;
  next();
};

// --- Mock auth ---
app.post('/auth/login', (req, res) => {
  const { email } = req.body || {};
  const user = db.users.find((u) => u.email === email) || db.users[0];
  return res.json({ token: 'mock-token', user });
});

// --- SSE stream ---
app.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  res.flushHeaders?.();
  res.write(`event: hello\ndata: ${JSON.stringify({ ok: true, ts: nowISO() })}\n\n`);
  sseClients.add(res);

  // keepalive ping
  const ping = setInterval(() => {
    if (res.writableEnded) return;
    res.write(`event: ping\ndata: ${JSON.stringify({ ts: nowISO() })}\n\n`);
  }, 25000);

  req.on('close', () => {
    clearInterval(ping);
    sseClients.delete(res);
  });
});

// --- Announcements (read existing) ---
app.get('/announcements', (req, res) => res.json(db.announcements));

// --- Announcements: create (admin/staff) + comments ---
app.post('/announcements', requireRole(['admin', 'staff']), (req, res) => {
  const { title, body } = req.body || {};
  if (!title || !body) return res.status(400).json({ error: 'Missing fields' });
  const item = { id: uuid(), title, body, createdAt: nowISO(), authorId: req.user.id };
  db.announcements.unshift(item);
  broadcast('announcement:new', item);
  res.status(201).json(item);
});

app.get('/announcements/:id/comments', (req, res) => {
  res.json(db.announcementComments.filter((c) => c.announcementId === req.params.id));
});

app.post('/announcements/:id/comments', (req, res) => {
  const { email, body } = req.body || {};
  const u = db.users.find((x) => x.email === email) || db.users[0];
  const a = db.announcements.find((x) => x.id === req.params.id);
  if (!a) return res.status(404).json({ error: 'Announcement not found' });
  if (!body) return res.status(400).json({ error: 'Empty comment' });
  const c = { id: uuid(), announcementId: a.id, userId: u.id, body, createdAt: nowISO() };
  db.announcementComments.push(c);
  broadcast('announcement:comment', c);
  res.status(201).json(c);
});

// --- Payments ---
app.get('/payments', (req, res) => res.json(db.payments));
app.post('/payments/pay', (req, res) => {
  const { id } = req.body || {};
  const p = db.payments.find((x) => x.id === id);
  if (!p) return res.status(404).json({ error: 'Payment not found' });
  p.status = 'paid';
  p.paidAt = nowISO();
  return res.json(p);
});

// --- Maintenance ---
app.get('/maintenance', (req, res) => res.json(db.maintenance));
app.post('/maintenance', (req, res) => {
  const ticket = { id: uuid(), status: 'submitted', createdAt: nowISO(), ...req.body };
  db.maintenance.push(ticket);
  res.status(201).json(ticket);
});
app.patch('/maintenance/:id', (req, res) => {
  const t = db.maintenance.find((x) => x.id === req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  Object.assign(t, req.body);
  res.json(t);
});

// --- Bookings ---
app.get('/bookings', (req, res) => res.json(db.bookings));
app.post('/bookings', (req, res) => {
  const booking = { id: uuid(), status: 'pending', createdAt: nowISO(), ...req.body };
  db.bookings.push(booking);
  res.status(201).json(booking);
});
app.patch('/bookings/:id', (req, res) => {
  const b = db.bookings.find((x) => x.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  Object.assign(b, req.body);
  res.json(b);
});

// --- Visitors ---
app.get('/visitors', (req, res) => res.json(db.visitors));
app.post('/visitors', (req, res) => {
  const v = { id: uuid(), status: 'pre-authorized', createdAt: nowISO(), ...req.body };
  db.visitors.push(v);
  res.status(201).json(v);
});
app.patch('/visitors/:id', (req, res) => {
  const v = db.visitors.find((x) => x.id === req.params.id);
  if (!v) return res.status(404).json({ error: 'Not found' });
  Object.assign(v, req.body);
  res.json(v);
});

// --- Documents ---
app.get('/documents', (req, res) => res.json(db.documents));

// --- Users (admin helpers) ---
app.get('/users', (req, res) => res.json(db.users));
app.post('/users', (req, res) => {
  const u = { id: uuid(), ...req.body };
  db.users.push(u);
  res.status(201).json(u);
});

// --- Chat Threads + Messages ---
// My threads
app.get('/chat/threads', (req, res) => {
  const { email } = req.query;
  const u = db.users.find((x) => x.email === email) || db.users[0];
  const mine = db.threads.filter((t) => t.members.includes(u.id));
  res.json(mine);
});

// Create or get a DM thread
app.post('/chat/dm', (req, res) => {
  const { fromEmail, toEmail } = req.body || {};
  const from = db.users.find((x) => x.email === fromEmail);
  const to = db.users.find((x) => x.email === toEmail);
  if (!from || !to) return res.status(400).json({ error: 'Invalid users' });
  let thread = db.threads.find(
    (t) => t.type === 'dm' && t.members.includes(from.id) && t.members.includes(to.id) && t.members.length === 2
  );
  if (!thread) {
    thread = { id: uuid(), type: 'dm', members: [from.id, to.id] };
    db.threads.unshift(thread);
    broadcast('thread:new', { thread });
  }
  res.status(201).json(thread);
});

// Messages
app.get('/chat/messages', (req, res) => {
  const { threadId } = req.query;
  res.json(db.messages.filter((m) => m.threadId === threadId).slice(-200));
});

app.post('/chat/send', (req, res) => {
  const { threadId, fromEmail, body } = req.body || {};
  const from = db.users.find((x) => x.email === fromEmail) || db.users[0];
  const t = db.threads.find((x) => x.id === threadId);
  if (!t) return res.status(404).json({ error: 'Thread not found' });
  if (!body) return res.status(400).json({ error: 'Empty message' });
  const msg = { id: uuid(), threadId, fromUserId: from.id, body, createdAt: nowISO() };
  db.messages.push(msg);
  broadcast('chat:message', msg);
  res.status(201).json(msg);
});

// --- Discussions (forum) ---
app.post('/discussions', (req, res) => {
  const { email, title, body, tags = [] } = req.body || {};
  const u = db.users.find((x) => x.email === email) || db.users[0];
  if (!title || !body) return res.status(400).json({ error: 'Missing fields' });
  const d = { id: uuid(), title, body, authorId: u.id, tags, createdAt: nowISO(), locked: false };
  db.discussions.unshift(d);
  broadcast('discussion:new', d);
  res.status(201).json(d);
});
app.get('/discussions', (req, res) => res.json(db.discussions));
app.get('/discussions/:id/replies', (req, res) =>
  res.json(db.discussionReplies.filter((r) => r.discussionId === req.params.id))
);
app.post('/discussions/:id/replies', (req, res) => {
  const { email, body } = req.body || {};
  const u = db.users.find((x) => x.email === email) || db.users[0];
  const d = db.discussions.find((x) => x.id === req.params.id);
  if (!d) return res.status(404).json({ error: 'Discussion not found' });
  if (d.locked) return res.status(403).json({ error: 'Locked' });
  const r = { id: uuid(), discussionId: d.id, authorId: u.id, body, createdAt: nowISO() };
  db.discussionReplies.push(r);
  broadcast('discussion:reply', r);
  res.status(201).json(r);
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`GateZen backend running on http://localhost:${port}`);
});
