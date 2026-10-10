var CRM = window.CRM = window.CRM || {};
CRM.COLS = ['Leads', 'Interagiram', 'Follow-up', 'Agendaram reunião', 'Novos clientes'];
CRM.KEY = 'crm-prospeccao-v2';
CRM.state = { settings: { apiKey: '' }, searches: [], leads: [] };
CRM.$ = function (id) { return document.getElementById(id); };
CRM.uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
CRM.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
CRM.load = function () {
  try { var s = JSON.parse(localStorage.getItem(CRM.KEY)); if (s) CRM.state = Object.assign(CRM.state, s); } catch (e) {}
};
CRM.save = function () {
  try { localStorage.setItem(CRM.KEY, JSON.stringify(CRM.state)); } catch (e) {}
  if (CRM.onChange) CRM.onChange();
};
CRM.searchLabel = function (id) {
  var s = CRM.state.searches.filter(function (x) { return x.id === id; })[0];
  return s ? s.label : 'Manual';
};
CRM.fillSegments = function (sel) {
  var v = sel.value;
  sel.innerHTML = '<option value="">Todas as pesquisas</option>' + CRM.state.searches.map(function (s) {
    return '<option value="' + s.id + '">' + CRM.esc(s.label) + '</option>';
  }).join('');
  sel.value = v;
};
CRM.moveLead = function (id, col) {
  CRM.state.leads.forEach(function (l) {
    if (l.id === id) { l.col = col; (l.hist = l.hist || []).push({ c: col, at: Date.now() }); }
  });
  CRM.save();
};
CRM.whatsapp = function (t) {
  var d = (t || '').replace(/\D/g, ''); if (!d) return '';
  if (d.length <= 11) d = '55' + d; return 'https://wa.me/' + d;
};
