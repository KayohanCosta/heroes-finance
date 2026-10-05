# Instalação e configuração

## Ambientes e requisitos

Use Node.js 24 LTS, npm e navegador moderno. O projeto é ESM e usa TypeScript no frontend, API e testes. O lockfile registra as versões resolvidas; use npm ci para uma instalação reproduzível.

| Modo | Dados | Identidade | Restrição |
| --- | --- | --- | --- |
| Local | JSON em data/ | Conta local e hash scrypt | Uma instância |
| Supabase | Postgres | Supabase Auth e sessão própria | Servidor com chave privilegiada |

Os modos não sincronizam automaticamente. Ativar Supabase não transfere senhas nem importa dados JSON. Planeje qualquer migração e preserve backups privados.

## Preparação

Clone o repositório, execute npm ci e copie .env.example para .env. Nunca substitua o modelo por valores reais. Alterar variáveis exige reiniciar a API ou fazer novo deploy.

## Referência de variáveis

| Variável | Uso | Observação |
| --- | --- | --- |
| SUPABASE_URL | Produção | URL do projeto escolhido |
| SUPABASE_SERVICE_ROLE_KEY | Produção | Segredo privilegiado, exclusivo do servidor |
| KAYOHAN_EMAIL | Login | E-mail mapeado a Kayohan |
| ARIELLE_EMAIL | Login | E-mail mapeado a Arielle; distinto do anterior |
| OPENROUTER_API_KEY | IA opcional | Prioridade sobre OpenAI |
| OPENROUTER_MODEL | IA opcional | Identificador do modelo no provedor |
| OPENAI_API_KEY | Alternativa | Usada sem chave OpenRouter |
| OPENAI_MODEL | Alternativa | Padrão gpt-4.1-mini |
| PORT | API local | Padrão 3001 |
| APP_ORIGIN | Proxy/produção | Origens exatas, separadas por vírgula |
| NODE_ENV | Runtime | production ativa cookie Secure |
| VERCEL | Runtime gerenciado | Não configurar manualmente |
| HEROES_NO_LISTEN | Testes | 1 impede listener durante import |
| HEROES_API_TEST | Teste opcional | 1 ativa cenário com API real local |
| HEROES_TEST_COOKIE | Teste opcional | Credencial temporária; não versionar |

Não coloque segredos em variáveis VITE_. Elas podem ser incorporadas no bundle público.

## Contas locais

Deixe ambas as variáveis Supabase vazias. Execute:

```sh
npm run account -- Kayohan kayohan@example.test
npm run account -- Arielle arielle@example.test
```

O comando exige terminal interativo, confirma a senha e grava salt/hash. Aceita 8 a 256 caracteres. Após redefinir senha local, reinicie a API para encerrar sessões em memória. Quando não há contas, a inicialização pode preparar convites privados para os perfis configurados. Não publique códigos ou links de ativação.

Execute npm run server e npm run dev em terminais diferentes. UI na porta 5173; API na 3001. Se mudar a porta da API, ajuste o proxy em vite.config.ts.

## Supabase

Execute as migrations em ordem: 001_finance.sql, 002_commitments.sql, 003_debts.sql e 004_sessions.sql. Elas não são idempotentes: verificar histórico antes de repetir uma aplicação.

Crie e confirme duas contas em Authentication → Users. Configure os e-mails nas variáveis dos owners. A API usa a identidade retornada pelo provedor e compara com o mapeamento; uma conta sem correspondência não ganha acesso financeiro.

A URL e chave devem pertencer ao mesmo projeto. Uma chave publicável não substitui a chave de serviço nessa arquitetura. A chave fica no ambiente privado do servidor.

## IA

Sem chave, a interpretação local atende resumo/sobra, gasolina e propostas simples de despesa. Com chave, o provedor recebe mensagens e resultados das ferramentas do perfil. Veja SECURITY.md antes de enviar dados pessoais ao modelo.

## Aceitação da configuração

Use dados fictícios: faça login, confira identidade, crie receita/despesa, valide resumo e extrato, registre/desfaça pagamento e faça logout. Verifique que a outra identidade recebe 403 e que uma sessão encerrada recebe 401. Uma página de login carregada não prova funcionamento do banco.
