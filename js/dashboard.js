(function () {
  var C = CRM, $ = C.$;
  function bars(rows) {
    var max = Math.max.apply(null, rows.map(function (r) { return r[1]; }).concat(1));
    return rows.map(function (r) {
      return '<div class="br"><span>' + C.esc(r[0]) + '</span><i style="width:' + (r[1] / max * 100) + '%"></i><b>' + r[1] + '</b></div>';
    }).join('') || '<div class="empty">Sem dados ainda.</div>';
  }
  C.renderDashboard = function () {
    var L = C.state.leads, n = function (c) { return L.filter(function (l) { return l.col === c; }).length; };
    var inK = L.filter(function (l) { return l.col != null; }).length, won = n(4);
    var k = [[L.length, 'Contatos'], [inK, 'No Kanban'], [n(1) + n(2), 'Em conversa'], [n(3), 'Reuniões agendadas'], [won, 'Novos clientes'],
      [(L.length ? Math.round(won / L.length * 100) : 0) + '%', 'Conversão']];
    $('kpis').innerHTML = k.map(function (x) { return '<div class="kpi"><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join('');
    $('funnel').innerHTML = bars(C.COLS.map(function (c, i) { return [c, n(i)]; }));
    $('bySearch').innerHTML = bars(C.state.searches.map(function (s) {
      return [s.label, L.filter(function (l) { return l.searchId === s.id; }).length];
    }).slice(0, 8));
    var days = [], max = 1, i;
    for (i = 13; i >= 0; i--) {
      var d0 = new Date(); d0.setHours(0, 0, 0, 0); d0 = d0.getTime() - i * 864e5;
      var c = L.filter(function (l) { return l.created >= d0 && l.created < d0 + 864e5; }).length;
      days.push(c); max = Math.max(max, c);
    }
    $('daily').innerHTML = days.map(function (c) { return '<div style="height:' + (c / max * 100) + '%"><span>' + (c || '') + '</span></div>'; }).join('');
    var ev = [];
    L.forEach(function (l) { (l.hist || []).forEach(function (h) { ev.push({ n: l.nome, c: h.c, at: h.at }); }); });
    ev.sort(function (a, b) { return b.at - a.at; });
    $('recent').innerHTML = ev.slice(0, 8).map(function (e) {
      return '<div class="rec"><b>' + C.esc(e.n) + '</b> → ' + C.COLS[e.c] + '<br><span class="muted">' + new Date(e.at).toLocaleString('pt-BR') + '</span></div>';
    }).join('') || '<div class="empty">Nenhuma movimentação ainda.</div>';
  };
})();
