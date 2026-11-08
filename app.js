const API = '/api/tickets';
const $ = (id) => document.getElementById(id);
let selectedId = null;

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    let message = 'Request failed (' + res.status + ')';
    try {
      const err = await res.json();
      message = err.message || message;
      if (err.errors && Object.keys(err.errors).length) {
        message += ': ' + Object.values(err.errors).join(', ');
      }
    } catch (e) { /* ignore non-JSON error bodies */ }
    throw new Error(message);
  }
  return res.status === 204 ? null : res.json();
}

function badge(kind, value) {
  const span = document.createElement('span');
  span.className = 'badge ' + kind + '-' + value;
  span.textContent = value.replace('_', ' ');
  return span;
}

function formatDate(iso) {
  return iso ? new Date(iso).toLocaleString() : '-';
}

function setMessage(el, text, type) {
  el.textContent = text;
  el.className = 'msg' + (type ? ' ' + type : '');
}

// ---------- Stats ----------
async function loadStats() {
  const s = await api(API + '/stats');
  const items = [
    ['Total', s.total], ['Open', s.open], ['In progress', s.inProgress],
    ['Resolved', s.resolved], ['Closed', s.closed], ['High/Critical open', s.highPriorityOpen],
  ];
  const box = $('stats');
  box.replaceChildren();
  items.forEach(([label, num]) => {
    const div = document.createElement('div');
    div.className = 'stat';
    const n = document.createElement('div');
    n.className = 'num';
    n.textContent = num;
    const l = document.createElement('div');
    l.className = 'label';
    l.textContent = label;
    div.append(n, l);
    box.appendChild(div);
  });
}

// ---------- Ticket list ----------
async function loadTickets() {
  const params = new URLSearchParams();
  if ($('search').value.trim()) params.set('q', $('search').value.trim());
  if ($('filterStatus').value) params.set('status', $('filterStatus').value);
  if ($('filterPriority').value) params.set('priority', $('filterPriority').value);

  const tickets = await api(API + (params.toString() ? '?' + params : ''));
  const body = $('ticketRows');
  body.replaceChildren();
  $('emptyMsg').hidden = tickets.length > 0;

  tickets.forEach((t) => {
    const tr = document.createElement('tr');
    const cells = [t.id, t.title, t.category];
    cells.forEach((value, i) => {
      const td = document.createElement('td');
      if (i === 1) td.className = 'title';
      td.textContent = value;
      tr.appendChild(td);
    });
    const tdP = document.createElement('td');
    tdP.appendChild(badge('p', t.priority));
    const tdS = document.createElement('td');
    tdS.appendChild(badge('s', t.status));
    const tdA = document.createElement('td');
    tdA.textContent = t.assignedTo || '-';
    const tdD = document.createElement('td');
    tdD.textContent = formatDate(t.createdAt);
    tr.append(tdP, tdS, tdA, tdD);
    tr.addEventListener('click', () => openDetail(t.id));
    body.appendChild(tr);
  });
}

// ---------- Ticket detail ----------
async function openDetail(id) {
  const t = await api(API + '/' + id);
  selectedId = t.id;
  $('detail').hidden = false;
  $('detailTitle').textContent = '#' + t.id + ' ' + t.title;
  $('detailMeta').textContent =
    t.category + ' | reported by ' + t.reportedBy +
    ' | assigned to ' + (t.assignedTo || 'nobody') +
    ' | created ' + formatDate(t.createdAt) +
    (t.resolvedAt ? ' | resolved ' + formatDate(t.resolvedAt) : '');
  $('detailDesc').textContent = t.description;
  $('detailStatus').value = t.status;

  const list = $('comments');
  list.replaceChildren();
  if (t.comments.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No comments yet.';
    list.appendChild(li);
  }
  t.comments.forEach((c) => {
    const li = document.createElement('li');
    const who = document.createElement('span');
    who.className = 'who';
    who.textContent = c.author;
    const when = document.createElement('span');
    when.className = 'when';
    when.textContent = formatDate(c.createdAt);
    const msg = document.createElement('div');
    msg.textContent = c.message;
    li.append(who, when, msg);
    list.appendChild(li);
  });
  $('detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function refresh() {
  await Promise.all([loadStats(), loadTickets()]);
}

// ---------- Events ----------
$('ticketForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const msg = $('formMsg');
  const data = Object.fromEntries(new FormData(form));
  try {
    const created = await api(API, { method: 'POST', body: JSON.stringify(data) });
    form.reset();
    setMessage(msg, 'Ticket #' + created.id + ' created', 'ok');
    await refresh();
  } catch (err) {
    setMessage(msg, err.message, 'error');
  }
});

$('commentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  try {
    await api(API + '/' + selectedId + '/comments', { method: 'POST', body: JSON.stringify(data) });
    form.elements.message.value = '';
    await openDetail(selectedId);
  } catch (err) {
    alert(err.message);
  }
});

$('detailStatus').addEventListener('change', async (e) => {
  try {
    await api(API + '/' + selectedId + '/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: e.target.value }),
    });
    await Promise.all([refresh(), openDetail(selectedId)]);
  } catch (err) {
    alert(err.message);
  }
});

$('deleteTicket').addEventListener('click', async () => {
  if (!confirm('Delete ticket #' + selectedId + '?')) return;
  try {
    await api(API + '/' + selectedId, { method: 'DELETE' });
    $('detail').hidden = true;
    selectedId = null;
    await refresh();
  } catch (err) {
    alert(err.message);
  }
});

$('closeDetail').addEventListener('click', () => { $('detail').hidden = true; });

let searchTimer;
$('search').addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadTickets, 300);
});
$('filterStatus').addEventListener('change', loadTickets);
$('filterPriority').addEventListener('change', loadTickets);

refresh().catch((err) => alert(err.message));
