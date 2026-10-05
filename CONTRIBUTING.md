# Contribuição

## Preparação

Leia README, Arquitetura, Produto e Segurança. Use contas fictícias e ambiente de desenvolvimento. Configure .env privadamente; não inclua dumps, convites, prints de sessões reais ou tokens em branch/PR.

Instale com npm ci e confira testes/build antes de alterar comportamento. Mantenha lockfile ao mudar dependências.

## Fluxo

1. Criar branch com propósito claro.
2. Implementar alteração restrita ao problema.
3. Atualizar documentação do contrato/regra afetada.
4. Adicionar teste significativo para nova regra ou regressão.
5. Executar npm test e npm run build.
6. Revisar diff, arquivos ignorados e segurança.
7. Abrir PR com problema, comportamento final e validação.

O repositório público não concede licença própria de reutilização. Discuta contribuição relevante com o titular e respeite licenças das dependências e ativos.

## Convenções

Usar TypeScript; tipos do domínio em módulos compartilhados. Validar input no servidor. Preservar owner da sessão em toda consulta/escrita. Dinheiro é agregado em centavos; datas financeiras são ISO sem horário.

Não adicionar chave no frontend, SQL arbitrário ao agente ou policy ampla no banco. Não aceitar ownership do corpo. Mudança de regra de parcela exige ajustar código e SQL.

## Commits e revisão

Prefira mensagens como feat: adicionar regra, fix: corrigir comportamento, docs: documentar contrato ou chore: atualizar configuração. Descrição deve explicar efeito concreto e testes; não copiar conversa ou dados pessoais.

Critérios de aceitação: regra correta, isolamento mantido, erros legíveis, regressão coberta quando relevante, docs consistentes e ausência de segredos.

## Migrations

Não editar migration já aplicada para esconder evolução. Gerar nova migration pelo CLI conforme fluxo vigente do Supabase, revisar SQL e aplicar primeiro em banco de teste. Mudanças destrutivas exigem plano de backup/recuperação. Nunca usar acesso SQL para ler arquivos do servidor.

## Dados em issues

Use nomes, datas e valores fictícios. Não colar cookie, env, e-mail real ou histórico pessoal. Vulnerabilidades com informações sensíveis devem seguir SECURITY.md.
