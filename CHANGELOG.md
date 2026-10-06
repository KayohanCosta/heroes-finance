# Histórico de alterações

Este histórico descreve capacidades do código, não certifica deployment, uptime ou conformidade.

## 1.0.0

### Controle financeiro

- Dashboard com cinco métricas e períodos semanal/mensal.
- CRUD de receitas/despesas com área, categoria, descrição, valor e data.
- Extrato detalhado, filtros e saldo acumulado.
- Contas recorrentes mensais/semanais.
- Empréstimos com agenda mensal e histórico de pagamentos.
- Pagamentos vinculados à despesa, idempotência e ação de desfazer.
- Contas a negociar e total de dívidas.
- Lembretes internos de próximos vencimentos e pendências.

### Identidade e assistência

- Login individual para dois perfis, validado na API.
- Modo local com hashes scrypt e Supabase Auth em produção.
- Sessões próprias persistentes no Supabase.
- Heroes Agent com ferramentas controladas e propostas confirmáveis.
- Interpretação local quando não há chave de IA.

### Experiência e engenharia

- Interface escura responsiva, controles personalizados e calendário sobreposto.
- Atalhos flutuantes e tutorial persistido por perfil/navegador.
- Configuração Vercel, migrations e exemplo de ambiente sem segredos.
- Testes de domínio e integração local.
- Documentação de arquitetura, API, banco, segurança e operação.
# Lembretes programados — 1.1.0

- Aba Lembretes, recorrência única/diária/semanal/mensal, edição, pausa e exclusão.
- Propostas de lembretes pelo Heroes Agent com confirmação e owner controlado.
- APK com horários personalizados, conteúdo discreto e agenda local de 60 dias.
- Integração Resend, dispatcher Supabase Cron, fila com retries e idempotência.
- E-mail sinalizado como pendente enquanto remetente e chave não estiverem configurados.
