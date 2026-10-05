# Publicação e operação

## Preparação de produção

Use Supabase em produção. A Vercel não deve gravar arquivos locais: sua entrada retorna 503 sem URL e chave. Configure duas contas confirmadas, migrations 001–004 e mapeamento de e-mails.

| Configuração Vercel | Valor esperado |
| --- | --- |
| Framework | Vite |
| Instalação | npm ci |
| Build | npm run build |
| Saída | dist |
| Função | api/index.ts |
| Limite configurado | 60 segundos |
| Runtime Node recomendado | 24 |

vercel.json encaminha /api/:path* à função Express e define X-Content-Type-Options, Referrer-Policy e X-Frame-Options. Não alterar o rewrite sem testar todas as rotas financeiras. Uma rota de login válida não garante que URLs de recurso chegam corretamente ao Express.

Configure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, KAYOHAN_EMAIL, ARIELLE_EMAIL, APP_ORIGIN e, opcionalmente, as variáveis do provedor de IA. Secrets devem ser privados/encrypted ou sensitive no painel. Configure separadamente Production e Preview conforme necessário. Não use o banco pessoal de produção para testes destrutivos de preview.

## Deploy manual

Na pasta do projeto:

```sh
vercel login
vercel link
vercel deploy
```

O preview permite verificar o build e a UI. Defina origem correspondente se o ambiente exigir essa URL. Depois de revisar:

```sh
vercel deploy --prod
```

A pasta .vercel contém identificadores privados de vínculo e é ignorada. Ao clonar o repositório, vincule a sua conta/projeto; não copie identificadores de outra organização. Um endereço desejado depende de disponibilidade e vínculo no painel.

## Integração Git

A presença do repositório não ativa deploy automático por si só. Importe/vincule o repositório no projeto Vercel, confirme a branch de produção e revise protection settings. O workflow de CI incluído faz testes/build; ele não contém tokens nem publica na Vercel.

Mudanças de variável só têm efeito em um novo deployment. Não assumir que editar uma configuração atualizou funções já publicadas.

## Verificação após deploy

- Conferir URL final, build e logs.
- Abrir login sem autenticação e confirmar ausência de dados pessoais.
- Entrar com conta de teste e conferir owner.
- Consultar /api/auth/me e /api/health autenticado.
- Criar, editar e excluir lançamento fictício.
- Conferir totais e extrato.
- Registrar/desfazer uma ocorrência de compromisso de teste.
- Verificar outro owner com a mesma sessão: 403.
- Sair e confirmar 401.
- Testar agente e proposta sem confirmação: nada gravado.
- Confirmar cookie Secure/HttpOnly e ausência de segredos no bundle.
- Conferir acesso por navegador sem login Vercel: a proteção da plataforma pode bloquear visitantes mesmo quando o app está correto.

Faça verificações com dados sintéticos e remova os registros de teste. Não crie pagamentos reais para testar a implantação.

## Rollback

Vercel pode promover deployment previamente validado ou usar rollback. Use painel ou comandos apresentados pelo CLI. Antes, identifique uma versão funcional. Rollback de código não reverte migrations nem restaura dados. Se um schema novo for incompatível, é preciso um plano separado de banco.

Não apagar tabelas para compatibilizar código antigo. Prefira evolução compatível ou correção progressiva. Preserve backup antes de mudanças que possam perder dados.

## Backup

Local: copie data/finance.json e arquivos de contas em local privado, com API parada para snapshot consistente. Nunca incluir em ZIP público. Produção: estratégia de backup depende do plano Supabase e deve preservar esquema, funções e relações financeiras. Verifique retenção e teste restauração em banco separado.

Uma política operacional deve definir frequência, retenção, responsável e objetivo de recuperação. Este projeto não promete RPO/RTO ou backups automáticos configurados. Sessões podem ser invalidadas na restauração para reduzir risco.

## Sessões e manutenção

A validade é checada por expires_at; entradas antigas não dão acesso. Não existe job de limpeza automática. Uma limpeza administrativa pode remover apenas sessões expiradas, depois de validar ambiente e consulta. Para bloquear owner imediatamente, revogue suas sessões próprias além da conta Auth quando necessário.

## Diagnóstico

| Sintoma | Verificação |
| --- | --- |
| 503 na função | URL/chave Supabase ausentes ou inválidas |
| Login falha | E-mail confirmado, mapeamento distinto, projeto da chave correto |
| 403 em escrita | Origin/Host/APP_ORIGIN ou owner da sessão |
| 401 após reinício local | Sessões em memória são descartadas |
| Erro de auth_sessions | Migration 004 e acesso de servidor |
| Empréstimos falham | Migration 002 e funções SQL |
| Dívidas falham | Migration 003 |
| IA não responde | Chave, modelo, limite e resposta do provedor |
| Alteração não aparece | Deployment/branch/alias corretos e novo build |
| fetch failed no CLI | Rede, autenticação e conectividade da máquina |

Leia logs privados sem imprimir env ou cookies. O middleware atual agrupa diversas falhas em 400; diferencie causa pelo contexto e mensagem sanitizada.

## Desativação

Preserve backup privado, bloqueie usuários/sessões e revogue credenciais. Desvincular domínio não remove dados do Supabase. Remover deployment não revoga uma chave que já tenha vazado. Planeje cada componente separadamente.
