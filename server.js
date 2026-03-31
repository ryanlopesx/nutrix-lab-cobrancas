const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Default message templates ───────────────────────────────────────────────
const DEFAULT_MESSAGES = [
  "Olá {nome}, tudo bem? Sou da equipe Nutrix Lab e estou entrando em contato pois identificamos uma pendência financeira referente ao produto que foi entregue ao senhor(a). Pedimos que entre em contato pelo (11) 95977-7425 para que possamos regularizar juntos. Aguardamos seu retorno. Atenciosamente, Nutrix Lab.",
  "Bom dia, {nome}! A Nutrix Lab identificou uma pendência em aberto no seu cadastro referente a um produto entregue. Por favor, entre em contato conosco pelo (11) 95977-7425 para que possamos resolver essa situação da melhor forma. Contamos com sua colaboração.",
  "Olá {nome}, aqui é a equipe de relacionamento da Nutrix Lab. Consta em nosso sistema uma pendência financeira referente ao produto Nutrix Lab entregue ao senhor(a), CPF {cpf}. Solicitamos que nos contate pelo (11) 95977-7425 para regularizarmos. Obrigado pela atenção.",
  "Prezado(a) {nome}, a Nutrix Lab vem por meio desta mensagem comunicar que existe uma pendência financeira em seu nome referente ao produto entregue. Para regularizar sua situação, entre em contato conosco pelo telefone (11) 95977-7425. Ficamos à sua disposição.",
  "Boa tarde, {nome}! Identificamos que há uma pendência referente ao seu produto Nutrix Lab ainda em aberto. Para evitar maiores transtornos, entre em contato conosco pelo (11) 95977-7425 e vamos encontrar a melhor solução para o seu caso. Equipe Nutrix Lab.",
  "Olá {nome}, a Nutrix Lab está tentando contato pois há uma pendência financeira referente ao produto entregue ao senhor(a). Gostaríamos de resolver essa situação de forma amigável. Por favor, retorne nossa ligação ou nos chame pelo (11) 95977-7425. Grato(a).",
  "Caro(a) {nome}, gostaríamos de informar que existe em nosso sistema uma pendência financeira referente ao produto Nutrix Lab que foi entregue ao CPF {cpf}. Pedimos a gentileza de entrar em contato pelo (11) 95977-7425 para tratarmos esse assunto. Atenciosamente, Nutrix Lab.",
  "{nome}, bom dia! A equipe Nutrix Lab identificou uma pendência em aberto referente ao produto entregue. É importante que entremos em contato para regularizar sua situação. Por favor, nos acione pelo (11) 95977-7425. Estaremos à disposição para ajudá-lo(a).",
  "Olá {nome}! Sou do setor de atendimento da Nutrix Lab. Verificamos que há uma pendência financeira referente ao produto entregue ao senhor(a). Gostaríamos de resolver isso o quanto antes. Entre em contato pelo (11) 95977-7425. Contamos com sua atenção.",
  "Prezado(a) {nome}, a Nutrix Lab solicita gentilmente que entre em contato conosco, pois identificamos uma pendência financeira referente ao produto que foi entregue. Estamos disponíveis pelo (11) 95977-7425 para encontrar a melhor solução. Obrigado.",
  "Boa tarde, {nome}. Aqui é a Nutrix Lab. Consta em nosso sistema uma pendência referente ao produto entregue ao senhor(a), CPF {cpf}. Para regularizarmos sua situação de forma rápida e prática, entre em contato pelo (11) 95977-7425. Aguardamos seu retorno.",
  "Olá {nome}, esperamos que esteja bem. A Nutrix Lab está entrando em contato pois há uma pendência financeira em aberto referente ao produto que foi entregue. Para resolvermos juntos, por favor nos contate pelo (11) 95977-7425. Equipe Nutrix Lab.",
  "{nome}, aqui é a Nutrix Lab. Identificamos uma pendência financeira referente ao produto entregue ao senhor(a). Gostaríamos muito de resolver essa situação de maneira amigável e facilitar o processo para você. Entre em contato pelo (11) 95977-7425.",
  "Caro(a) {nome}, a Nutrix Lab informa que há uma pendência financeira referente ao produto Nutrix Lab entregue. Estamos à disposição para encontrar a melhor solução para o seu caso. Entre em contato conosco pelo (11) 95977-7425. Obrigado pela colaboração.",
  "Olá {nome}! A equipe Nutrix Lab está tentando entrar em contato referente a uma pendência financeira do produto entregue. Temos interesse em resolver essa situação de forma amigável. Por favor, nos contate pelo (11) 95977-7425. Aguardamos seu retorno.",
  "Bom dia, {nome}. A Nutrix Lab vem reforçar a comunicação sobre a pendência financeira referente ao produto que foi entregue ao seu CPF {cpf}. Para regularizar, entre em contato conosco pelo (11) 95977-7425. Estamos prontos para atendê-lo(a).",
  "Olá {nome}, tudo certo? A Nutrix Lab identificou que há uma pendência em seu cadastro referente ao produto entregue. Para resolvermos essa situação da melhor forma possível, entre em contato pelo (11) 95977-7425. Agradecemos sua atenção.",
  "Prezado(a) {nome}, a Nutrix Lab está entrando em contato para informar sobre uma pendência financeira referente ao produto entregue. Para regularizar sua situação, pedimos que nos contate pelo (11) 95977-7425. Contamos com sua compreensão. Equipe Nutrix Lab.",
  "{nome}, boa tarde! Sou da equipe Nutrix Lab e identificamos uma pendência financeira referente ao produto que foi entregue ao senhor(a). Gostaríamos de encontrar a melhor solução para esse caso. Entre em contato pelo (11) 95977-7425. Obrigado.",
  "Olá {nome}! A Nutrix Lab informa que há uma pendência financeira em aberto referente ao produto entregue ao CPF {cpf}. Pedimos que entre em contato conosco pelo (11) 95977-7425 para que possamos regularizar juntos. Atenciosamente, Equipe Nutrix Lab.",
  "Caro(a) {nome}, a Nutrix Lab está tentando entrar em contato pois identificamos uma pendência referente ao produto que foi entregue. Para resolvermos de forma ágil, entre em contato pelo (11) 95977-7425. Aguardamos o seu retorno com atenção.",
  "Olá {nome}, bom dia! A equipe de atendimento da Nutrix Lab identificou uma pendência financeira referente ao produto entregue. Para evitar qualquer inconveniência, solicitamos que entre em contato conosco pelo (11) 95977-7425. Estamos à disposição.",
  "{nome}, a Nutrix Lab precisa falar com o senhor(a) sobre uma pendência financeira referente ao produto entregue. Estamos disponíveis pelo (11) 95977-7425 para resolvermos juntos da melhor forma. Contamos com sua colaboração. Obrigado, Equipe Nutrix Lab.",
  "Boa noite, {nome}! A Nutrix Lab está entrando em contato pois identificamos uma pendência em aberto referente ao produto entregue ao senhor(a). Para regularizarmos, entre em contato pelo (11) 95977-7425. Aguardamos seu retorno em breve. Equipe Nutrix Lab.",
  "Prezado(a) {nome}, a Nutrix Lab informa que há uma pendência financeira referente ao produto Nutrix Lab entregue ao CPF {cpf}. Temos interesse em resolver essa situação de forma amigável. Por favor, entre em contato pelo (11) 95977-7425. Atenciosamente, Nutrix Lab.",
  "Olá {nome}, aqui é a Nutrix Lab. Consta em nosso cadastro uma pendência referente ao produto entregue. Gostaríamos muito de conversar e resolver essa pendência. Entre em contato conosco pelo (11) 95977-7425. Aguardamos seu contato. Obrigado.",
  "Bom dia, {nome}! A Nutrix Lab solicita que entre em contato pois há uma pendência financeira referente ao produto que foi entregue ao senhor(a). Para regularizar de forma simples e rápida, acione-nos pelo (11) 95977-7425. Contamos com você.",
  "Olá {nome}, espero que esteja bem. A equipe Nutrix Lab identificou uma pendência em seu nome referente ao produto entregue. Pedimos que entre em contato pelo (11) 95977-7425 para que possamos resolver juntos. Agradecemos sua atenção e retorno.",
  "{nome}, a Nutrix Lab está entrando em contato referente a uma pendência financeira do produto entregue ao CPF {cpf}. Para tratarmos esse assunto de forma rápida e eficiente, entre em contato pelo (11) 95977-7425. Equipe Nutrix Lab aguarda seu retorno.",
  "Prezado(a) {nome}, a Nutrix Lab vem por meio desta mensagem solicitar seu contato referente à pendência financeira do produto entregue. Estamos disponíveis pelo (11) 95977-7425 para regularizarmos essa situação de forma simples. Atenciosamente, Nutrix Lab."
];

// ─── Data helpers ─────────────────────────────────────────────────────────────
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = {
      clients: [],
      senders: [],
      products: [],
      messages: DEFAULT_MESSAGES.map((t, i) => ({ id: `msg-default-${i + 1}`, template: t, productId: null })),
      history: [],
      config: {
        evolutionUrl: process.env.EVOLUTION_URL || '',
        evolutionApiKey: process.env.EVOLUTION_APIKEY || ''
      }
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return loadData(); // re-create if corrupted
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── Evolution API helper ─────────────────────────────────────────────────────
function evoClient() {
  const data = loadData();
  const baseURL = (data.config.evolutionUrl || '').replace(/\/$/, '');
  const apikey = data.config.evolutionApiKey || '';
  return axios.create({ baseURL, headers: { apikey }, timeout: 15000 });
}

// ─── Routes: Products ────────────────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  const data = loadData();
  if (!data.products) { data.products = []; saveData(data); }
  res.json(data.products);
});

app.post('/api/products', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome do produto é obrigatório.' });
  const data = loadData();
  if (!data.products) data.products = [];
  const product = { id: uid(), name: name.trim(), createdAt: new Date().toISOString() };
  data.products.push(product);
  saveData(data);
  res.status(201).json(product);
});

app.put('/api/products/:id', (req, res) => {
  const data = loadData();
  if (!data.products) data.products = [];
  const idx = data.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Produto não encontrado.' });
  data.products[idx].name = (req.body.name || '').trim() || data.products[idx].name;
  saveData(data);
  res.json(data.products[idx]);
});

app.delete('/api/products/:id', (req, res) => {
  const data = loadData();
  if (!data.products) data.products = [];
  data.products = data.products.filter(p => p.id !== req.params.id);
  // unlink clients and messages from this product
  data.clients.forEach(c => { if (c.productId === req.params.id) c.productId = null; });
  data.messages.forEach(m => { if (m.productId === req.params.id) m.productId = null; });
  saveData(data);
  res.json({ ok: true });
});

// ─── Routes: Config ───────────────────────────────────────────────────────────
app.get('/api/config', (req, res) => {
  const data = loadData();
  res.json(data.config);
});

app.put('/api/config', (req, res) => {
  const data = loadData();
  const { evolutionUrl, evolutionApiKey } = req.body;
  data.config = {
    evolutionUrl: evolutionUrl || '',
    evolutionApiKey: evolutionApiKey || ''
  };
  saveData(data);
  res.json({ ok: true });
});

// ─── Routes: Clients ──────────────────────────────────────────────────────────
app.get('/api/clients', (req, res) => {
  res.json(loadData().clients);
});

app.post('/api/clients', (req, res) => {
  const { name, cpf, phone, interval, productId } = req.body;
  if (!name || !cpf || !phone || !interval) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }
  const digits = phone.replace(/\D/g, '');
  const fullPhone = digits.startsWith('55') ? digits : '55' + digits;
  const data = loadData();
  const client = {
    id: uid(),
    name: name.trim(),
    cpf: cpf.replace(/\D/g, ''),
    phone: fullPhone,
    interval: Number(interval),
    productId: productId || null,
    lastSent: null,
    lastMessageId: null,
    createdAt: new Date().toISOString()
  };
  data.clients.push(client);
  saveData(data);
  res.status(201).json(client);
});

app.put('/api/clients/:id', (req, res) => {
  const data = loadData();
  const idx = data.clients.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Cliente não encontrado.' });
  const { name, cpf, phone, interval, productId } = req.body;
  const digits = (phone || '').replace(/\D/g, '');
  const fullPhone = digits.startsWith('55') ? digits : '55' + digits;
  data.clients[idx] = {
    ...data.clients[idx],
    name: (name || data.clients[idx].name).trim(),
    cpf: cpf ? cpf.replace(/\D/g, '') : data.clients[idx].cpf,
    phone: fullPhone || data.clients[idx].phone,
    interval: interval ? Number(interval) : data.clients[idx].interval,
    productId: productId !== undefined ? (productId || null) : data.clients[idx].productId
  };
  saveData(data);
  res.json(data.clients[idx]);
});

app.delete('/api/clients/:id', (req, res) => {
  const data = loadData();
  const before = data.clients.length;
  data.clients = data.clients.filter(c => c.id !== req.params.id);
  if (data.clients.length === before) return res.status(404).json({ error: 'Cliente não encontrado.' });
  saveData(data);
  res.json({ ok: true });
});

app.post('/api/clients/import', (req, res) => {
  const { rows, interval, productId } = req.body;
  if (!Array.isArray(rows) || !rows.length) return res.status(400).json({ error: 'Nenhum dado enviado.' });
  const data = loadData();
  const imported = [];
  const skipped = [];
  for (const row of rows) {
    const name = (row.name || '').trim();
    const cpf = (row.cpf || '').replace(/\D/g, '');
    const phone = (row.phone || '').replace(/\D/g, '');
    if (!name || !cpf || !phone) { skipped.push(row); continue; }
    const fullPhone = phone.startsWith('55') ? phone : '55' + phone;
    const client = {
      id: uid(),
      name,
      cpf,
      phone: fullPhone,
      interval: Number(interval) || 2,
      productId: productId || null,
      lastSent: null,
      lastMessageId: null,
      createdAt: new Date().toISOString()
    };
    data.clients.push(client);
    imported.push(client);
  }
  saveData(data);
  res.status(201).json({ imported: imported.length, skipped: skipped.length });
});

// ─── Routes: Senders ─────────────────────────────────────────────────────────
app.get('/api/senders', (req, res) => {
  res.json(loadData().senders);
});

app.post('/api/senders', async (req, res) => {
  const { instanceName } = req.body;
  if (!instanceName) return res.status(400).json({ error: 'Nome da instância é obrigatório.' });
  try {
    const evo = evoClient();
    try {
      await evo.post('/instance/create', { instanceName, integration: 'WHATSAPP-BAILEYS', qrcode: true });
    } catch (createErr) {
      // If instance already exists in Evolution, that's ok — just register locally
      const msg = String(createErr.response?.data?.message || createErr.message || '');
      if (!msg.toLowerCase().includes('already') && !msg.toLowerCase().includes('exists') && createErr.response?.status !== 409) {
        throw createErr;
      }
    }
    const data = loadData();
    if (data.senders.find(s => s.instanceName === instanceName)) {
      return res.status(409).json({ error: 'Instância já cadastrada localmente.' });
    }
    const sender = { id: uid(), instanceName, status: 'connecting', createdAt: new Date().toISOString() };
    data.senders.push(sender);
    saveData(data);
    res.status(201).json(sender);
  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.error || err.message;
    res.status(500).json({ error: `Erro ao criar instância: ${msg}` });
  }
});

app.delete('/api/senders/:instanceName', async (req, res) => {
  const { instanceName } = req.params;
  try {
    const evo = evoClient();
    await evo.delete(`/instance/delete/${instanceName}`).catch(() => {});
  } catch {}
  const data = loadData();
  data.senders = data.senders.filter(s => s.instanceName !== instanceName);
  saveData(data);
  res.json({ ok: true });
});

app.get('/api/senders/:instanceName/qr', async (req, res) => {
  const { instanceName } = req.params;
  try {
    const evo = evoClient();
    const resp = await evo.get(`/instance/connect/${instanceName}`);
    const d = resp.data;
    // Normalize across Evolution API v1 / v2 response formats
    const qr = d?.qrcode || d;
    const base64 = qr?.base64 || d?.base64 || null;
    const code   = qr?.code   || d?.code   || null;
    const pairingCode = qr?.pairingCode || d?.pairingCode || null;
    res.json({ base64, code, pairingCode, _raw: d });
  } catch (err) {
    const msg = err.response?.data?.message
      || (Array.isArray(err.response?.data) ? err.response.data[0] : null)
      || err.message;
    res.status(500).json({ error: msg });
  }
});

app.get('/api/senders/:instanceName/status', async (req, res) => {
  const { instanceName } = req.params;
  try {
    const evo = evoClient();
    const resp = await evo.get(`/instance/fetchInstances`, { params: { instanceName } });
    const d = resp.data;
    // Handle array, single object, or nested {instance:{}} formats
    let inst = null;
    if (Array.isArray(d)) {
      inst = d.find(i => (i.instanceName || i.instance?.instanceName) === instanceName);
    } else if (d?.instance) {
      inst = d.instance.instanceName === instanceName ? d.instance : null;
    } else if (d?.instanceName === instanceName) {
      inst = d;
    }
    const status = inst?.connectionStatus || inst?.status || 'close';
    // normalize Evolution v2 connectionStatus values
    const normalized = status === 'open' || status === 'ONLINE' ? 'open' : status;
    const data = loadData();
    const s = data.senders.find(s => s.instanceName === instanceName);
    if (s && s.status !== normalized) { s.status = normalized; saveData(data); }
    res.json({ status: normalized, _raw: inst });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debug: retorna resposta bruta da Evolution para diagnóstico
app.get('/api/debug/evo/:instanceName', async (req, res) => {
  try {
    const evo = evoClient();
    const [connectResp, fetchResp] = await Promise.allSettled([
      evo.get(`/instance/connect/${req.params.instanceName}`),
      evo.get(`/instance/fetchInstances`, { params: { instanceName: req.params.instanceName } })
    ]);
    res.json({
      connect: connectResp.status === 'fulfilled' ? connectResp.value.data : { error: connectResp.reason?.message },
      fetch:   fetchResp.status === 'fulfilled'   ? fetchResp.value.data   : { error: fetchResp.reason?.message }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Routes: Messages ─────────────────────────────────────────────────────────
app.get('/api/messages', (req, res) => {
  res.json(loadData().messages);
});

app.post('/api/messages', (req, res) => {
  const { template, productId } = req.body;
  if (!template) return res.status(400).json({ error: 'Template é obrigatório.' });
  const data = loadData();
  const msg = { id: uid(), template: template.trim(), productId: productId || null, createdAt: new Date().toISOString() };
  data.messages.push(msg);
  saveData(data);
  res.status(201).json(msg);
});

app.put('/api/messages/:id', (req, res) => {
  const data = loadData();
  const idx = data.messages.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Mensagem não encontrada.' });
  if (req.body.template !== undefined) data.messages[idx].template = req.body.template.trim();
  if (req.body.productId !== undefined) data.messages[idx].productId = req.body.productId || null;
  saveData(data);
  res.json(data.messages[idx]);
});

app.delete('/api/messages/:id', (req, res) => {
  const data = loadData();
  const before = data.messages.length;
  data.messages = data.messages.filter(m => m.id !== req.params.id);
  if (data.messages.length === before) return res.status(404).json({ error: 'Mensagem não encontrada.' });
  saveData(data);
  res.json({ ok: true });
});

// ─── Routes: History ──────────────────────────────────────────────────────────
app.get('/api/history', (req, res) => {
  const data = loadData();
  res.json([...data.history].reverse());
});

app.delete('/api/history', (req, res) => {
  const data = loadData();
  data.history = [];
  saveData(data);
  res.json({ ok: true });
});

// ─── Scheduler ────────────────────────────────────────────────────────────────
async function runScheduler() {
  const data = loadData();
  const { clients, senders, messages, config } = data;

  if (!config.evolutionUrl || !config.evolutionApiKey) return;
  if (!messages.length) return;

  const connectedSenders = senders.filter(s => s.status === 'open');
  if (!connectedSenders.length) return;

  const now = Date.now();

  for (const client of clients) {
    const intervalMs = (client.interval || 1) * 60 * 60 * 1000;
    const lastSentMs = client.lastSent ? new Date(client.lastSent).getTime() : 0;
    if (now - lastSentMs < intervalMs) continue;

    // Pick random sender
    const sender = connectedSenders[Math.floor(Math.random() * connectedSenders.length)];

    // Pick message from client's product pool (fallback to all if no product or no product msgs)
    const productMsgs = client.productId
      ? messages.filter(m => m.productId === client.productId)
      : messages.filter(m => !m.productId);
    const pool = (productMsgs.length ? productMsgs : messages);
    const available = pool.length > 1
      ? pool.filter(m => m.id !== client.lastMessageId)
      : pool;
    const msgObj = available[Math.floor(Math.random() * available.length)];
    const text = msgObj.template
      .replace(/\{nome\}/gi, client.name)
      .replace(/\{cpf\}/gi, client.cpf);

    let status = 'sent';
    let errorMsg = null;

    try {
      const evo = evoClient();
      await evo.post(`/message/sendText/${sender.instanceName}`, {
        number: client.phone,
        text,
        delay: 1000
      });
      client.lastSent = new Date().toISOString();
      client.lastMessageId = msgObj.id;
    } catch (err) {
      status = 'error';
      errorMsg = err.response?.data?.message || err.message;
    }

    data.history.push({
      id: uid(),
      clientId: client.id,
      clientName: client.name,
      phone: client.phone,
      sender: sender.instanceName,
      message: text,
      status,
      error: errorMsg,
      timestamp: new Date().toISOString()
    });

    // Keep history at max 5000 entries
    if (data.history.length > 5000) data.history = data.history.slice(-5000);
  }

  saveData(data);
}

// ─── Sync sender statuses every 2 minutes ─────────────────────────────────────
async function syncSenderStatuses() {
  const data = loadData();
  if (!data.config.evolutionUrl || !data.config.evolutionApiKey || !data.senders.length) return;
  try {
    const evo = evoClient();
    const resp = await evo.get('/instance/fetchInstances');
    const remoteList = Array.isArray(resp.data) ? resp.data : [resp.data];
    let changed = false;
    for (const s of data.senders) {
      const remote = remoteList.find(r => r.instanceName === s.instanceName);
      const newStatus = remote?.status || 'close';
      if (s.status !== newStatus) { s.status = newStatus; changed = true; }
    }
    if (changed) saveData(data);
  } catch {}
}

// ─── Init DEFAULT_SENDERS from env ────────────────────────────────────────────
async function initDefaultSenders() {
  const names = (process.env.DEFAULT_SENDERS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!names.length) return;
  const data = loadData();
  for (const instanceName of names) {
    if (data.senders.find(s => s.instanceName === instanceName)) continue;
    try {
      const evo = evoClient();
      await evo.post('/instance/create', { instanceName, integration: 'WHATSAPP-BAILEYS', qrcode: true });
      data.senders.push({ id: uid(), instanceName, status: 'connecting', createdAt: new Date().toISOString() });
      console.log(`[Nutrix Lab] Instância criada: ${instanceName}`);
    } catch (err) {
      console.warn(`[Nutrix Lab] Falha ao criar instância ${instanceName}:`, err.message);
    }
  }
  saveData(data);
}

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`[Nutrix Lab] Cobranças Nutrix Lab rodando na porta ${PORT}`);
  loadData(); // ensure data.json exists
  await initDefaultSenders();
  setInterval(runScheduler, 60 * 1000);
  setInterval(syncSenderStatuses, 2 * 60 * 1000);
  setTimeout(syncSenderStatuses, 5000); // initial sync after 5s
});
