(function () {
  var C = CRM, $ = C.$, results = [], ctx = {};
  C.searchPlaces = async function (query, max) {
    var key = C.state.settings.apiKey;
    if (!key) throw new Error('Configure sua chave da Google Places API em Configurações.');
    var out = [], token = null;
    do {
      var body = { textQuery: query, languageCode: 'pt-BR', pageSize: 20 };
      if (token) body.pageToken = token;
      var r = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.googleMapsUri,nextPageToken'
        },
        body: JSON.stringify(body)
      });
      var j = await r.json();
      if (!r.ok) throw new Error((j.error && j.error.message) || 'Erro ' + r.status);
      (j.places || []).forEach(function (p) {
        out.push({ placeId: p.id, nome: p.displayName ? p.displayName.text : '', end: p.formattedAddress || '', tel: p.nationalPhoneNumber || '',
          site: p.websiteUri || '', rating: p.rating || 0, reviews: p.userRatingCount || 0, mapsUrl: p.googleMapsUri || '' });
      });
      token = j.nextPageToken;
    } while (token && out.length < max);
    return out.slice(0, max);
  };
  function known(pid) { return C.state.leads.some(function (l) { return l.placeId === pid; }); }
  function render() {
    $('s-tools').hidden = !results.length;
    $('s-res').innerHTML = results.map(function (p, i) {
      var d = known(p.placeId);
      return '<label class="res' + (d ? ' dup' : '') + '"><input type="checkbox" data-i="' + i + '"' + (d ? ' disabled' : ' checked') + '><div><b>' + C.esc(p.nome) + '</b>' +
        '<small>' + C.esc(p.end) + '</small><small>' + C.esc(p.tel || 'sem telefone') + (p.rating ? ' · ★ ' + p.rating + ' (' + p.reviews + ')' : '') + (d ? ' · já importado' : '') + '</small></div></label>';
    }).join('');
  }
  $('s-go').onclick = async function () {
    var seg = $('s-seg').value.trim(), cid = $('s-cid').value.trim();
    if (!seg) { $('s-seg').focus(); return; }
    ctx = { seg: seg, cid: cid };
    $('s-go').disabled = true; $('s-status').textContent = 'Buscando…'; results = []; render();
    try {
      results = await C.searchPlaces((seg + ' ' + cid).trim(), +$('s-max').value);
      $('s-status').textContent = results.length + ' empresas encontradas.';
    } catch (e) { $('s-status').textContent = 'Erro: ' + e.message; }
    $('s-go').disabled = false; render();
  };
  $('s-all').onchange = function (e) {
    document.querySelectorAll('#s-res input:not(:disabled)').forEach(function (c) { c.checked = e.target.checked; });
  };
  $('s-imp').onclick = function () {
    var sel = [];
    document.querySelectorAll('#s-res input:checked').forEach(function (c) { sel.push(results[+c.dataset.i]); });
    if (!sel.length) { $('s-status').textContent = 'Nenhuma empresa selecionada.'; return; }
    var sid = C.uid(), kb = $('s-kb').checked, now = Date.now();
    C.state.searches.unshift({ id: sid, label: ctx.seg + (ctx.cid ? ' em ' + ctx.cid : ''), at: now });
    sel.forEach(function (p) {
      C.state.leads.unshift({ id: C.uid(), searchId: sid, placeId: p.placeId, nome: p.nome, tel: p.tel, end: p.end, site: p.site,
        rating: p.rating, mapsUrl: p.mapsUrl, nota: '', created: now, col: kb ? 0 : null, hist: kb ? [{ c: 0, at: now }] : [] });
    });
    C.save(); render();
    $('s-status').textContent = sel.length + ' contatos importados' + (kb ? ' e enviados ao Kanban.' : '.');
  };
})();
