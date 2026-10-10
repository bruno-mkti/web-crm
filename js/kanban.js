(function () {
  var C = CRM, $ = C.$, dragId = null;
  C.renderKanban = function () {
    C.fillSegments($('k-seg'));
    var s = $('k-seg').value, q = $('k-q').value.toLowerCase(), b = $('board'); b.innerHTML = '';
    C.COLS.forEach(function (name, ci) {
      var list = C.state.leads.filter(function (l) {
        return l.col === ci && (!s || l.searchId === s) && (!q || (l.nome + l.tel + l.end + l.nota).toLowerCase().indexOf(q) > -1);
      });
      var col = document.createElement('div'); col.className = 'col';
      col.innerHTML = '<div class="ch"><span>' + name + '</span><span class="n">' + list.length + '</span></div>' + (list.length ? '' : '<div class="empty">Arraste contatos para cá.</div>');
      col.ondragover = function (e) { e.preventDefault(); col.classList.add('over'); };
      col.ondragleave = function () { col.classList.remove('over'); };
      col.ondrop = function (e) { e.preventDefault(); col.classList.remove('over'); if (dragId) C.moveLead(dragId, ci); };
      list.forEach(function (l) {
        var d = document.createElement('div'); d.className = 'card'; d.draggable = true;
        d.ondragstart = function () { dragId = l.id; };
        var w = C.whatsapp(l.tel);
        d.innerHTML = '<b>' + C.esc(l.nome) + '</b>' + (l.tel ? '<small>' + C.esc(l.tel) + '</small>' : '') +
          '<small>' + C.esc(C.searchLabel(l.searchId)) + '</small>' + (l.nota ? '<p>' + C.esc(l.nota) + '</p>' : '') +
          '<div class="act"><select aria-label="Mover para">' + C.COLS.map(function (x, i) { return '<option value="' + i + '"' + (i === l.col ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select>' +
          (w ? '<a href="' + w + '" target="_blank" rel="noopener">WhatsApp</a>' : '') +
          (l.mapsUrl ? '<a href="' + C.esc(l.mapsUrl) + '" target="_blank" rel="noopener">Maps</a>' : '') +
          '<button data-e>Editar</button></div>';
        d.querySelector('select').onchange = function (e) { C.moveLead(l.id, +e.target.value); };
        d.querySelector('[data-e]').onclick = function () { C.openLead(l.id); };
        col.appendChild(d);
      });
      b.appendChild(col);
    });
  };
  $('k-seg').onchange = C.renderKanban; $('k-q').oninput = C.renderKanban;
})();
