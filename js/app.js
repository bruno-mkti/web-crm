(function () {
  var C = CRM, $ = C.$;
  C.load();
  function renderAll() { C.renderDashboard(); C.renderContacts(); C.renderKanban(); }
  C.onChange = renderAll;
  $('nav').onclick = function (e) {
    var v = e.target.dataset.v; if (!v) return;
    document.querySelectorAll('#nav button').forEach(function (b) { b.classList.toggle('on', b === e.target); });
    document.querySelectorAll('.view').forEach(function (s) { s.classList.toggle('on', s.id === 'v-' + v); });
  };
  $('cfg-key').value = C.state.settings.apiKey || '';
  $('cfg-save').onclick = function () { C.state.settings.apiKey = $('cfg-key').value.trim(); C.save(); alert('Chave salva.'); };
  $('cfg-exp').onclick = function () {
    var a = document.createElement('a'); a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(C.state));
    a.download = 'crm-backup.json'; document.body.appendChild(a); a.click(); a.remove();
  };
  $('cfg-imp').onclick = function () { $('cfg-file').click(); };
  $('cfg-file').onchange = function (e) {
    var f = e.target.files[0]; if (!f) return; var r = new FileReader();
    r.onload = function () { try { C.state = Object.assign({ settings: {}, searches: [], leads: [] }, JSON.parse(r.result)); C.save(); alert('Backup restaurado.'); } catch (x) { alert('Arquivo inválido.'); } };
    r.readAsText(f);
  };
  $('cfg-clr').onclick = function () {
    if (confirm('Apagar todos os contatos e pesquisas?')) { C.state.leads = []; C.state.searches = []; C.save(); }
  };
  renderAll();
})();
