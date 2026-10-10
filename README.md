# Prospecta — CRM de prospecção

Estrutura: `index.html`, `css/style.css`, `js/` (storage, search, contacts, kanban, dashboard, app).

## Como rodar
Na pasta do projeto: `python3 -m http.server 8000` e abra http://localhost:8000
(abrir o index.html direto também funciona, mas o Google pode recusar a chave).

## Google Places API
1. No Google Cloud, crie um projeto, ative **Places API (New)** e gere uma chave.
2. Restrinja a chave a `http://localhost:8000/*` (HTTP referrers).
3. Cole a chave em Configurações. A busca retorna até 60 empresas por pesquisa.
Obs.: telefone e site são campos pagos (Text Search Enterprise); confira a cota gratuita vigente.

## Fluxo
Buscar → selecionar → Importar (cada busca vira um segmento) → Contatos → Kanban → Dashboard.
Os dados ficam no localStorage; use o backup JSON em Configurações.
