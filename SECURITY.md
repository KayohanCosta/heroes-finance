# Segurança e privacidade

## Modelo de confiança

Código público não implica dados públicos. Finanças, contas, convites, hashes de senha, cookies, dumps e configuração privada são excluídos do versionamento.

A API é a fronteira de autorização. O navegador pode enviar qualquer caminho/corpo; somente a sessão determina a identidade. O backend filtra owner e id em operações sensíveis. A chave Supabase privilegiada torna o servidor um componente crítico.

## Credenciais

Nunca versionar .env, data/, .vercel/, tokens, certificados ou arquivos de recuperação. .env.example deve permanecer vazio de valores reais. Não imprimir segredos ao depurar, não colocá-los em screenshots e não usar variáveis VITE_.

O .gitignore protege arquivos não rastreados, mas não remove segredos já presentes em commits. Se uma credencial vazou, revogue/rotacione primeiro. Apagar uma linha depois não invalida o segredo nem elimina cópias históricas.

## Autenticação e sessões

Local: senhas scrypt com salt individual, comparação em tempo constante e armazenamento privado. Produção: Supabase Auth valida credenciais; e-mails retornados são mapeados aos dois owners por configuração do servidor.

Cookie HttpOnly, SameSite Strict, Secure em produção, validade de 12 horas. No Supabase, somente SHA-256 do token opaco é persistido. Logout revoga a sessão própria.

Revogar uma conta ou sessão em Supabase Auth não elimina automaticamente cookies próprios já emitidos: remova sessões próprias do owner quando for necessário bloquear imediatamente. Trocar o mapeamento de e-mail também não revoga sessões existentes.

## Origem e validação

Escritas verificam origem quando presente e exigem JSON. APP_ORIGIN deve conter origens exatas. Preserve Host/Origin no proxy. SameSite e validação de origem reduzem risco de CSRF, mas não equivalem a uma auditoria de segurança.

Zod valida enums, campos, dinheiro e datas. owner do corpo não reatribui registros. Identificadores de outros perfis não devem revelar dados.

## Banco

RLS habilitado, grants públicos revogados, funções privilegiadas limitadas ao papel de servidor. Não habilitar políticas amplas para corrigir um aviso informativo. Nunca enviar a chave de serviço ao navegador.

## IA

Perguntas e dados financeiros retornados por ferramentas podem sair para o provedor. Não colocar informações altamente sensíveis em descrição/conversa. Tool-calling não permite SQL arbitrário ou troca de owner. Escritas são propostas e passam pelo CRUD após confirmação.

## Limites conhecidos

- Rate limit de login em memória por instância; não é limite distribuído serverless.
- Sem MFA na interface, auditoria imutável, detecção de anomalias ou rotação automática de sessão.
- Sessões expiradas são rejeitadas, mas não há limpeza automática da tabela.
- Erros do middleware podem expor mensagens internas; sanitize logs/relatórios.
- Não há garantia certificada de conformidade regulatória ou isolamento multiempresa.
- Nenhuma auditoria independente ou pentest é afirmado.

## Divulgação de vulnerabilidades

Não publique credenciais, dados reais ou exploração com contas reais em issue pública. Use o canal privado disponibilizado pelo mantenedor; na ausência, peça um canal privado sem incluir o conteúdo sensível. GitHub Private Vulnerability Reporting pode ser usado se habilitado pelo titular.

Inclua versão, cenário mínimo com dados fictícios, impacto e reprodução. Evite manipular dados de terceiros.

## Incidente

1. Suspender operação afetada quando necessário.
2. Revogar chaves expostas e sessões relevantes.
3. Atualizar variáveis e fazer novo deploy.
4. Confirmar que a credencial antiga falha.
5. Examinar logs privados e extensão do acesso.
6. Corrigir causa e revisar histórico público quando houve vazamento.
7. Documentar o incidente de forma sanitizada.

Nunca pedir ao usuário que envie segredo por issue ou mensagem pública.
