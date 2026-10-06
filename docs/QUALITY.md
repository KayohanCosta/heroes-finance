# Testes e qualidade

## Comandos

```sh
npm ci
npm test
npm run build
```

npm test executa arquivos tests/*.test.ts com tsx e node:test. Build verifica TypeScript e compila frontend com Vite. CI executa ambos sem credenciais de produção. A aprovação desses comandos não prova Supabase Auth, rede externa ou deployment real.

## Matriz automatizada

| Arquivo | Evidência |
| --- | --- |
| domain.test.ts | Métricas, isolamento, semana, ano bissexto, categoria, centavos e inválidos |
| commitments.test.ts | Meses curtos, recorrência semanal, lembretes e validações |
| debts.test.ts | Total em centavos, owner e campos inválidos |
| auth.test.ts | Login, cookie, rotas de outro owner, logout e convite de uso único |
| payment-flow.test.ts | Express real local, repetição concorrente, despesa, desfazer e dívidas |
| api.test.ts | Cenário opcional contra API local autenticada |

A suíte principal reúne 23 casos, incluindo sete testes de lembretes programados. O cenário opcional exige configuração e não deve ser contado como executado quando está skipped. Testes locais usam contas/dados sintéticos e diretórios temporários. Eles não fazem login em contas pessoais reais.

## Teste opcional de API

Exige API local ativa, HEROES_API_TEST=1 e HEROES_TEST_COOKIE de sessão Kayohan de desenvolvimento. Trata cookie como segredo. Não adicionar ao repositório ou log.

```powershell
$env:HEROES_API_TEST = '1'
$env:HEROES_TEST_COOKIE = '<cookie de teste configurado privadamente>'
npm test
Remove-Item Env:HEROES_TEST_COOKIE
Remove-Item Env:HEROES_API_TEST
```

O cenário cria e limpa registros próprios, mas use banco de desenvolvimento: não há isolamento por tenant de teste além do owner/IDs gerados. Sem chave externa, o agente utiliza modo local e resultados determinísticos.

## Verificação manual

| Área | Caso | Resultado esperado |
| --- | --- | --- |
| Login | Credenciais inválidas | Sem sessão e mensagem |
| Perfil | Alterar owner em requisição | 403, nenhum dado do outro |
| Valores | 0, negativo, terceira casa | Rejeição |
| Data | Data inexistente | Rejeição |
| Resumo | Receita 1000, trabalho 200, pessoal 150 | Sobra 650 |
| Extrato | Esconder despesa pelo filtro | Saldo acumulado não muda |
| Parcela | Primeiro vencimento dia 31 | Ajuste em mês curto, dia original retomado |
| Pagamento | Repetir ocorrência | Uma despesa |
| Desfazer | Pagamento existente | Despesa removida, pendência reaberta |
| Agente | Proposta sem confirmar | Nenhuma escrita |
| Tutorial | Reentrar no mesmo navegador | Não abrir automaticamente |
| UI | Tela pequena, dropdown/calendário | Controles utilizáveis e sobreposição correta |
| Movimento | prefers-reduced-motion | Efeitos reduzidos conforme CSS |
| Logout | Cookie anterior | 401 |

Teste teclado, foco, legibilidade e zoom sem afirmar certificação de acessibilidade. Calendários, modais sobrepostos e controles personalizados merecem atenção especial.

## Limites de evidência

Não há teste automatizado de navegador, cobertura percentual publicada, teste de carga, auditoria independente, ensaio distribuído do rate limit ou garantia de uptime. A suíte local não comprova todos os caminhos SQL em produção. Registre separadamente resultados de CI, teste Supabase e smoke test de deployment.

## Política de regressão

Nova regra financeira precisa de teste que capture comportamento, incluindo fronteiras relevantes. Mudanças visuais simples não exigem testes que apenas copiem estrutura de CSS. Alterar TypeScript e SQL de agenda exige conferir equivalência em meses curtos, ano bissexto e ownership.

Os testes de lembretes cobrem interpretação sem LLM, fuso de Brasília, meses curtos, privacidade, destinatário por owner e idempotência do Resend. O cenário de API real também cobre CRUD de lembretes, pausa, revisão e bloqueio entre perfis. O envio real de e-mail permanece pendente de configuração do provedor.

