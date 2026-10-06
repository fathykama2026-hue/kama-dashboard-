// خادم بسيط بدون أي مكتبات خارجية: يعرض الداشبورد ويحفظ التصنيفات في ملف
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const PASSWORD = process.env.PASSWORD || '';
const FILE = path.join(DATA_DIR, 'departments.json');
const ALLOWED = new Set(['الصيانة', 'الإنتاج']);

fs.mkdirSync(DATA_DIR, { recursive: true });
let departments = {};
try { departments = JSON.parse(fs.readFileSync(FILE, 'utf8')) || {}; } catch (e) { departments = {}; }

function persist() {
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(departments));
  fs.renameSync(tmp, FILE); // كتابة آمنة: لا يتلف الملف لو انقطع التشغيل
}

function authorized(req) {
  if (!PASSWORD) return true;
  const h = req.headers.authorization || '';
  if (!h.startsWith('Basic ')) return false;
  const pass = Buffer.from(h.slice(6), 'base64').toString('utf8').split(':').slice(1).join(':');
  return pass === PASSWORD;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = '';
    req.on('data', c => { b += c; if (b.length > 1e6) { reject(new Error('too big')); req.destroy(); } });
    req.on('end', () => { try { resolve(JSON.parse(b || '{}')); } catch (e) { reject(e); } });
  });
}

const send = (res, code, obj) => {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
};

http.createServer(async (req, res) => {
  if (!authorized(req)) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Dashboard", charset="UTF-8"' });
    return res.end('Password required');
  }
  const url = req.url.split('?')[0];
  try {
    if (url === '/api/departments' && req.method === 'GET') return send(res, 200, departments);

    if (url === '/api/department' && req.method === 'POST') {
      const { material, department } = await readBody(req);
      const m = String(material || '').trim();
      if (!m) return send(res, 400, { error: 'material required' });
      if (department && !ALLOWED.has(department)) return send(res, 400, { error: 'bad department' });
      if (department) departments[m] = department; else delete departments[m];
      persist();
      return send(res, 200, { ok: true, departments });
    }

    if (url === '/api/departments' && req.method === 'POST') {
      // دمج وليس استبدال، حتى لا يمسح شخص تصنيفات أضافها غيره
      const body = await readBody(req);
      for (const [k, v] of Object.entries(body || {})) if (ALLOWED.has(v)) departments[String(k)] = v;
      persist();
      return send(res, 200, { ok: true, departments });
    }

    if (req.method === 'GET' && (url === '/' || url === '/index.html')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      return fs.createReadStream(path.join(__dirname, 'public', 'index.html')).pipe(res);
    }
    res.writeHead(404); res.end('Not found');
  } catch (e) { send(res, 400, { error: String(e.message || e) }); }
}).listen(PORT, () => console.log('Dashboard running on port ' + PORT + (PASSWORD ? ' (password protected)' : ' (NO PASSWORD SET)')));
