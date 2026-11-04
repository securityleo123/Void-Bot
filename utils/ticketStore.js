const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../data/tickets.json');

function ensureFile() {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '{}');
}

function load() {
  ensureFile();
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function save(data) {
  ensureFile();
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function createTicket(channelId, userId, guildId) {
  const data = load();
  data[channelId] = { userId, guildId, createdAt: Date.now() };
  save(data);
}

function getTicket(channelId) {
  return load()[channelId] || null;
}

function deleteTicket(channelId) {
  const data = load();
  delete data[channelId];
  save(data);
}

module.exports = { createTicket, getTicket, deleteTicket };
