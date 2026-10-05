# Contrato da API

## Convenções e identidade

Base: /api. Corpos e respostas são JSON. Escritas usam Content-Type: application/json. O cookie heroes_session é HttpOnly, SameSite Strict e Secure em produção. Não há token financeiro no localStorage.

O owner aceito é Kayohan ou Arielle e precisa coincidir com a sessão. Os nomes dos recursos usam transactions, fixed, loans, payments e debts. UUIDs identificam registros. Os exemplos deste guia são fictícios.

## Autenticação

| Método | Rota | Comportamento |
| --- | --- | --- |
| POST | /auth/login | Valida e-mail/senha e cria cookie |
| GET | /auth/me | Retorna owner ou 401 |
| POST | /auth/logout | Revoga sessão e limpa cookie |
| POST | /auth/activate | Ativação por convite local; não disponível com Supabase |
| GET | /health | Configuração de persistência/agente; exige sessão |

Login:

```json
{"email":"kayohan@example.test","password":"<senha inserida privadamente>"}
```

Resposta de login/me:

```json
{"owner":"Kayohan"}
```

Ativação local recebe email, password e code. Não documente convites reais em exemplos. Sessões duram 12 horas; não há renovação deslizante implementada.

## Recursos financeiros

Para transactions, fixed, loans e debts:

| Método | Rota | Resultado |
| --- | --- | --- |
| GET | /:owner/:table | Array dos registros do perfil |
| POST | /:owner/:table | Registro criado |
| PUT | /:owner/:table/:id | Registro atualizado |
| DELETE | /:owner/:table/:id | Registro excluído |

Listagem de payments usa GET /:owner/payments. Escrita genérica nesse recurso é recusada; use o fluxo de pagamento.

Criações e atualizações retornam HTTP 200, não 201. PUT espera campos completos; não é um PATCH parcial. Não há paginação, ordenação de servidor ou parâmetro de filtro nos endpoints de listagem. A interface filtra o conjunto retornado.

### Lançamento

```json
{
  "type":"despesa",
  "area":"trabalho",
  "category":"Gasolina",
  "description":"Abastecimento de exemplo",
  "value":50,
  "date":"2026-01-10"
}
```

Campos: type receita/despesa; area pessoal/trabalho; category 1–80; description até 300; value positivo, até 10000000, no máximo duas casas; date existente em YYYY-MM-DD. owner e id são definidos pelo servidor na criação.

### Conta fixa

```json
{"name":"Conta de exemplo","value":100,"day":15,"area":"pessoal","recurrence":"monthly","startDate":"2026-01-01"}
```

recurrence monthly/weekly; day 1–31 ou 1–7 no modo weekly. Nome 1–80. Valor/data seguem domínio monetário. Ausência de recurrence usa monthly; ausência de startDate usa hoje.

### Empréstimo

```json
{"name":"Plano de exemplo","value":120,"installments":6,"firstDue":"2026-01-31","area":"pessoal"}
```

installments inteiro 1–360. firstDue é data válida. Plano com pagamento não aceita atualização.

### Dívida

```json
{"name":"Credor de exemplo","value":500,"description":"Valor informado para negociação"}
```

Nome de 1–80 caracteres, description até 500 caracteres (padrão vazio) e valor com as mesmas regras dos lançamentos. Dívidas não geram lançamentos.

## Pagamentos

POST /:owner/pay:

```json
{"kind":"loan","sourceId":"11111111-1111-4111-8111-111111111111","number":1,"due":"2026-01-31","paidAt":"2026-01-31"}
```

kind loan/fixed. number é parcela positiva para loan e zero para fixed. sourceId deve pertencer ao perfil. due precisa corresponder a ocorrência real. paidAt não pode estar no futuro. Repetir a mesma ocorrência retorna o pagamento existente.

DELETE /:owner/pay/:id desfaz pagamento e despesa vinculada, retornando {"ok":true}. Não confunda esta rota com exclusão direta de uma despesa vinculada.

## Agente

POST /:owner/agent recebe {"message":"Quanto me sobrou essa semana?"}. A mensagem tem 1–1000 caracteres. Resposta contém text e, quando aplicável, proposal.

Uma proposta inclui action create/update/delete, id quando aplicável e data para criação/edição. Não é gravada automaticamente. A confirmação da interface chama o CRUD normal, que valida novamente sessão, campos e owner. Não existe endpoint de execução arbitrária de ferramentas.

## Erros

| Status | Significado |
| --- | --- |
| 400 | Validação, registro inexistente, regra financeira ou erro genérico |
| 401 | Sessão ausente/expirada ou credenciais inválidas |
| 403 | Owner diferente ou origem proibida |
| 415 | Content-Type de escrita diferente de application/json |
| 429 | Limite local de tentativas de login |
| 503 | Configuração/serviço de login indisponível ou Supabase ausente na função publicada |

Formato usual: {"error":"Mensagem legível"}. Falhas do provedor de IA podem ser traduzidas em mensagem do middleware com HTTP 400, inclusive limite externo. Não confunda com o 429 do login.

A API atual não diferencia sistematicamente 404/409/422. Consumidores devem inspecionar status e mensagem. Não exponha mensagens/logs internos em relatórios públicos sem sanitização.
