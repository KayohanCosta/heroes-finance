# Banco de dados

## Organização

Postgres no Supabase, schema public. Finanças e sessões são acessadas exclusivamente pelo backend. RLS está habilitado em todas as seis tabelas e permissões de anon/authenticated foram revogadas. A chave de servidor exige proteção: ela ultrapassa RLS.

## Migrations

| Ordem | Arquivo | Alteração |
| --- | --- | --- |
| 1 | 001_finance.sql | transactions, fixed e índices por owner |
| 2 | 002_commitments.sql | Recorrências, loans, payments e funções atômicas |
| 3 | 003_debts.sql | debts e índice |
| 4 | 004_sessions.sql | auth_sessions e índice de expiração |

Aplicar uma vez em banco novo. Para banco existente, conferir objetos e histórico antes de aplicar. Não reexecutar cegamente, não apagar tabelas para resolver conflitos e não editar migration aplicada sem planejar evolução.

## Dicionário de dados

### transactions

| Campo | Tipo | Regra |
| --- | --- | --- |
| id | uuid | PK, gerado |
| owner | text | Kayohan/Arielle |
| type | text | receita/despesa |
| area | text | pessoal/trabalho |
| category | text | Trim, tamanho 1–80 |
| description | text | Até 300, padrão vazio |
| value | numeric(12,2) | Positivo, máximo 10000000 |
| date | date | Data financeira |

Índice transactions_owner_date atende filtros por perfil/data. O banco usa decimal exato; o código agrega centavos.

### fixed

id/owner seguem padrão. name identifica a conta; value é valor por ocorrência; day é dia mensal ou semanal; area classifica despesa. recurrence é monthly/weekly; startDate define início. O check impede dia maior que 7 para weekly. Índice por owner.

### loans

id, owner, name, value por parcela, installments de 1–360, firstDue e area. Agenda é calculada, não materializada em uma tabela de parcelas. A quantidade e o valor não representam cálculo de juros.

### payments

id e owner; kind loan/fixed; sourceId aponta logicamente ao compromisso; number distingue parcela, sendo zero para fixed; due é vencimento; paidAt é data efetiva; value preserva valor pago; transactionId é FK única para transactions.

sourceId é polimórfico e não tem FK para loans/fixed. Isso permite excluir compromisso sem apagar despesas já pagas. transactionId continua protegendo o vínculo com a despesa.

Unique por owner/kind/sourceId/due impede repetir ocorrência. Índice único parcial para loan por owner/sourceId/number impede repetir parcela. As validações da função conferem agenda e identidade.

### debts

id, owner, name, value e description (observações até 500 caracteres). Lista de valores informados para negociação. Não é passivo contábil automaticamente conectado ao caixa.

### auth_sessions

token_hash text é PK, contendo SHA-256 do token opaco. owner define identidade autorizada e expires_at determina validade. Índice de expiração apoia manutenção. Nenhuma senha ou token em texto puro deve entrar nessa tabela.

## Funções

pay_commitment recebe perfil, tipo, compromisso, parcela, vencimento e data paga. Bloqueia o registro de origem com FOR UPDATE, valida agenda, procura pagamento existente e cria despesa/vínculo atomicamente. O valor vem do compromisso, nunca do corpo da solicitação.

undo_commitment_payment bloqueia o pagamento, valida owner, exclui pagamento e despesa vinculada na mesma transação.

As funções são SECURITY DEFINER com search_path explícito e execução revogada de PUBLIC, anon e authenticated. Somente service_role executa. São interfaces internas privilegiadas, não RPCs para o navegador.

## Verificação de segurança

O advisor pode retornar informação de RLS habilitado sem policies. Nesta arquitetura isso é deliberado: clientes públicos não têm acesso; o backend valida owner. Consulte a [explicação do linter](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy). Não adicione policy permissiva apenas para silenciar o aviso.

Após mudanças, valide RLS, grants, acesso ao outro owner e funções. Não use user_metadata editável como fonte de autorização.

## Backup e recuperação

Backup financeiro precisa preservar tabelas relacionadas, esquema e funções. Backup apenas de transactions não restaura estado de compromissos e pagamentos. Dados de Auth exigem estratégia própria do provedor. Configure retenção e frequência conforme plano, risco e volume; este repositório não ativa backups automáticos.

Restaure primeiro em ambiente separado e confira contagens, vínculo payment/transaction, total por owner e login. Sessões são credenciais temporárias; invalidá-las durante recuperação pode ser apropriado. Não publique dumps.
