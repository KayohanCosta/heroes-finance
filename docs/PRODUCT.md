# Produto e regras financeiras

## Identidade e experiência

O login determina o perfil. Não há troca de owner pela interface. O tutorial usa localStorage com uma marca por perfil/navegador e pode ser reaberto em Primeiros passos. Limpar armazenamento ou trocar de dispositivo permite nova exibição.

A identidade visual utiliza tons escuros, Inter e JetBrains Mono. Ciano sinaliza entradas, âmbar destaca ações, verde indica resultado positivo e vermelho indica saídas ou resultado negativo. Os atalhos do agente enviam perguntas imediatamente; propostas de escrita exigem confirmação.

## Métricas

| Métrica | Regra |
| --- | --- |
| Receita bruta | Todas as receitas do período |
| Custos do trabalho | Despesas de área trabalho |
| Receita líquida | Bruta menos custos do trabalho |
| Gastos pessoais | Despesas de área pessoal |
| Sobra real | Bruta menos todas as despesas |

Receita pessoal também compõe receita bruta. A área classifica o uso; não representa uma conta bancária. Exemplo fictício: R$ 1.000,00 de receita, R$ 200,00 de trabalho e R$ 150,00 pessoais resultam em R$ 800,00 líquidos e R$ 650,00 de sobra.

As somas convertem cada valor para centavos inteiros antes de agregar. A API recebe reais com até duas casas decimais; o banco usa numeric(12,2).

## Datas

Hoje usa America/Sao_Paulo. Datas financeiras são YYYY-MM-DD. Semana de segunda a domingo; mês do primeiro ao último dia, incluindo ano bissexto. O período pode atravessar mês/ano. Datas inexistentes são rejeitadas.

## Lançamentos

Tipo receita/despesa, área pessoal/trabalho, categoria de 1 a 80 caracteres, descrição até 300, valor positivo até R$ 10.000.000,00 e data válida. Use valor positivo para ambos os tipos; o sinal é definido pelo tipo.

Excluir remove o registro, sem lixeira. Editar altera o movimento existente, sem auditoria imutável. Despesas geradas por pagamento precisam ser desfeitas no compromisso antes de alteração direta.

## Extrato

Ordena por data e identificador. Movimentos no mesmo dia não têm ordem cronológica de horário; o desempate por UUID é estável. O saldo acumulado soma receitas menos despesas de todo o histórico disponível.

Data define o período; tipo, área e busca ocultam linhas. Totais exibidos consideram as linhas visíveis. Saldo anterior, final e acumulado continuam considerando o histórico completo: esconder uma despesa não devolve dinheiro ao saldo.

O saldo não é bancário conciliado. Um histórico incompleto produz saldo diferente de uma conta real.

## Contas fixas

Mensais: dia de 1 a 31, ajustado ao último dia em meses curtos. Semanais: 1 segunda até 7 domingo. A data inicial impede gerar ocorrências anteriores à configuração. Cadastrar é planejamento; só o pagamento cria a despesa.

## Empréstimos

Plano com nome, valor por parcela, quantidade 1–360, primeiro vencimento e área. Parcelas mensais iguais. O dia original é preservado: vencimento no dia 31 vira 28/29 em fevereiro e volta a 31 em março.

Não calcula juros, CET ou amortização. Para plano em andamento, cadastre a agenda e registre parcelas anteriores nas datas reais. Um plano com pagamentos não pode ser atualizado diretamente pela API.

## Pagamento e lembretes

Registrar pagamento cria despesa e vínculo. Repetir a mesma ocorrência retorna o registro existente. Desfazer remove vínculo/despesa e reabre a pendência. Não duplique uma despesa manual com o pagamento de compromisso.

Excluir um compromisso preserva despesas pagas. O sistema registra controle; não transfere dinheiro ao credor.

O Dashboard mostra próximos 14 dias e pendências. Contas recorrentes têm retrospecto de atrasos de até 60 dias desde a data inicial. Lembretes são internos ao app; não há push, e-mail ou agendador.

## Dívidas

Contas a negociar guarda nome, valor informado e observações. O total soma apenas as dívidas do perfil. Não cria despesa ou empréstimo. Depois de negociar, atualize a dívida e cadastre parcelas quando necessário.

## Fora do escopo

Integração bancária, múltiplas moedas, anexos, exportação contábil, autenticação social, contas compartilhadas, pagamentos reais e notificações externas não estão implementados.
