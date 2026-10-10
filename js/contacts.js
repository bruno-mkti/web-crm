(function () {
  var C = CRM, $ = C.$, editId = null;
  function filtered() {
    var q = $('c-q').value.toLowerCase(), s = $('c-seg').value;
    return C.state.leads.filter(function (l) {
      return (!s || l.searchId === s) && (!q || (l.nome + l.tel + l.end).toLowerCase().indexOf(q) > -1);
    });
  }
  C.renderContacts = function () {
    C.fillSegments($('c-seg'));
    var list = filtered();
    $('c-count').textContent = '(' + list.length + ')';
    $('c-body').innerHTML = list.map(function (l) {
      var w = C.whatsapp(l.tel);
      return '<tr data-id="' + l.id + '"><td><b>' + C.esc(l.nome) + '</b><small>' + C.esc(l.end) + '</small></td>' +
        '<td>' + C.esc(l.tel || '—') + (w ? '<small><a href="' + w + '" target="_blank" rel="noopener">WhatsApp</a></small>' : '') + '</td>' +
        '<td>' + C.esc(C.searchLabel(l.searchId)) + '</td>' +
        '<td><select data-a="stage"><option value="">Fora do Kanban</option>' + C.COLS.map(function (c, i) {
          return '<option value="' + i + '"' + (l.col === i ? ' selected' : '') + '>' + c + '</option>';
        }).join('') + '</select></td>' +
        '<td><button data-a="edit">Editar</button> <button data-a="del">Excluir</button></td></tr>';
    }).join('') || '<tr><td colspan="5" class="empty">Nenhum contato. Faça uma busca ou crie um contato.</td></tr>';
  };
  function open(id) {
    editId = id;
    var l = C.state.leads.filter(function (x) { return x.id === id; })[0] || {};
    $('dt').textContent = id ? 'Editar contato' : 'Novo contato';
    $('f-nome').value = l.nome || ''; $('f-tel').value = l.tel || ''; $('f-end').value = l.end || '';
    $('f-site').value = l.site || ''; $('f-nota').value = l.nota || '';
    $('dl').showModal();
  }
  C.openLead = open;
  $('c-q').oninput = C.renderContacts; $('c-seg').onchange = C.renderContacts;
  $('c-new').onclick = function () { open(null); };
  $('f-cancel').onclick = function () { $('dl').close(); };
  $('f-save').onclick = function () {
    var nome = $('f-nome').value.trim(); if (!nome) { $('f-nome').focus(); return; }
    var o = { nome: nome, tel: $('f-tel').value.trim(), end: $('f-end').value.trim(), site: $('f-site').value.trim(), nota: $('f-nota').value.trim() };
    if (editId) C.state.leads.forEach(function (l) { if (l.id === editId) Object.assign(l, o); });
    else C.state.leads.unshift(Object.assign(o, { id: C.uid(), searchId: '', created: Date.now(), col: null, hist: [] }));
    C.save(); $('dl').close();
  };
  $('c-body').onclick = function (e) {
    var a = e.target.dataset.a, tr = e.target.closest('tr'); if (!a || !tr) return;
    if (a === 'edit') open(tr.dataset.id);
    if (a === 'del' && confirm('Excluir este contato?')) {
      C.state.leads = C.state.leads.filter(function (l) { return l.id !== tr.dataset.id; }); C.save();
    }
  };
  $('c-body').onchange = function (e) {
    if (e.target.dataset.a !== 'stage') return;
    var id = e.target.closest('tr').dataset.id, v = e.target.value;
    if (v === '') { C.state.leads.forEach(function (l) { if (l.id === id) l.col = null; }); C.save(); }
    else C.moveLead(id, +v);
  };
  $('c-kball').onclick = function () {
    var ids = filtered().filter(function (l) { return l.col == null; }).map(function (l) { return l.id; });
    ids.forEach(function (id) { C.moveLead(id, 0); });
    if (!ids.length) alert('Todos os contatos filtrados já estão no Kanban.');
  };
  $('c-csv').onclick = function () {
    var rows = [['Empresa', 'Telefone', 'Endereço', 'Site', 'Pesquisa', 'Etapa', 'Notas']].concat(filtered().map(function (l) {
      return [l.nome, l.tel, l.end, l.site, C.searchLabel(l.searchId), l.col == null ? '' : C.COLS[l.col], l.nota];
    }));
    var csv = rows.map(function (r) { return r.map(function (c) { return '"' + String(c || '').replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    var a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent('\ufeff' + csv);
    a.download = 'contatos.csv'; document.body.appendChild(a); a.click(); a.remove();
  };
})();
