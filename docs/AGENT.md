# Heroes Agent

## Objetivo e limites

Interface compacta para consultas financeiras e preparação de lançamentos. O modelo interpreta intenção; o backend acessa dados e calcula. A pergunta não pode trocar identidade. Não há SQL arbitrário, acesso a arquivos, navegação, execução de código ou ferramentas de infraestrutura.

## Ferramentas

| Ferramenta | Responsabilidade |
| --- | --- |
| getFinancialSummary | Resumo semanal/mensal, categoria opcional |
| getTransactions | Registros selecionados e total de despesas |
| createTransaction | Proposta de criação |
| updateTransaction | Proposta de edição de registro existente |
| deleteTransaction | Proposta de exclusão |

period aceita week/month. Categoria usa correspondência por trecho, sem distinção de maiúsculas/minúsculas. Uma consulta por gasolina depende da categoria registrada; não faz classificação semântica de todo o histórico.

O backend injeta owner da sessão. O modelo não recebe uma ferramenta de escolher owner. IDs para edição/exclusão devem existir no perfil. Dados são validados pelos mesmos schemas do CRUD.

## Fluxo

1. Cliente envia mensagem autenticada.
2. API fornece prompt com perfil e data.
3. Provedor recebe definições de ferramentas.
4. Pedido de ferramenta é validado e executado pelo código.
5. Leituras voltam ao modelo para redação.
6. Escritas retornam proposta à interface.
7. Usuário confirma e o CRUD valida novamente antes de gravar.

Até cinco rodadas de consulta são permitidas no laço. A solicitação usa parallel_tool_calls false e max_tokens 1024. Uma proposta de escrita encerra a resposta. A API não persiste conversas nem mantém histórico conversacional entre requisições.

## Exemplos

- Quanto me sobrou essa semana?
- Quanto gastei de gasolina esse mês?
- Gastei 50 de gasolina hoje.

Para registros ambíguos, o comportamento desejado é pedir informação; o usuário deve revisar área, categoria, data e valor da proposta. A confirmação é uma interação da UI, não um token assinado: clientes autenticados podem usar o CRUD diretamente.

## Provedores

OpenRouter tem prioridade se OPENROUTER_API_KEY está presente. Na ausência, OpenAI é alternativa. Sem chaves, o interpretador local responde a padrões restritos de resumo/gasolina/despesa; não equivale ao comportamento completo de um LLM.

O modelo é variável de ambiente. Um identificador com sufixo free não garante capacidade, disponibilidade ou custo futuro. O projeto não realiza fallback entre modelos automaticamente.

## Privacidade e confiabilidade

A pergunta e resultados de ferramentas podem ser enviados ao provedor, incluindo descrições financeiras. Revise política/retenção do provedor antes de uso real. Não envie senhas, números de cartão ou documentos na conversa.

Não confiar em texto do modelo como autorização ou como cálculo. A implementação exige valores financeiros das ferramentas, mas um LLM ainda pode redigir uma resposta incorreta. Confira números retornados e trate falhas externas como indisponibilidade, sem gravar automaticamente.

Mensagens de falha distinguem chave rejeitada, limite externo e outras respostas HTTP. Conversas locais não são persistidas pelo app; isso não afirma ausência de registros do provedor.

## Ferramentas de lembretes

getReminders consulta somente a conta autenticada. createReminder, updateReminder e deleteReminder preparam propostas com target reminders; o usuário confirma antes de qualquer alteração. Repetição, data, horário e canais são validados por reminderSchema. O owner e o endereço de e-mail nunca são argumentos aceitos nessas ferramentas. Frases diárias conhecidas também funcionam sem o modelo. Consulte [Lembretes](REMINDERS.md).

