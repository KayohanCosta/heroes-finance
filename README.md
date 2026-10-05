<p align="center"><img src="public/logo-heroes.svg" width="88" alt="Heroes" /></p>

<h1 align="center">Heroes Finance</h1>
<p align="center"><strong>Seu dinheiro. Sem complicação.</strong><br/>Controle financeiro pessoal, compromissos e uma conversa com seus números.</p>

<p align="center">React · TypeScript · Vite · Express · Supabase · OpenRouter</p>

## Visão geral

Heroes Finance reúne receitas, despesas, contas recorrentes, empréstimos e dívidas em uma interface escura e responsiva. O objetivo é responder quanto realmente sobra depois dos custos do trabalho e dos gastos pessoais.

Dois perfis fixos, Kayohan e Arielle, possuem registros separados. O login determina a identidade; não há seletor para acessar outra conta. Os nomes fazem parte do domínio, mas e-mails reais, senhas, dados financeiros e credenciais não fazem parte deste repositório.

O Heroes Agent interpreta perguntas e utiliza ferramentas controladas. Os cálculos são realizados pelo código. Alterações aparecem como propostas, confirmadas pelo usuário antes da gravação.

**Escopo:** aplicação pessoal para dois perfis. Não movimenta dinheiro, não integra contas bancárias e não oferece cadastro público ou aconselhamento de investimento.

## Documentação

| Guia | Conteúdo |
| --- | --- |
| [Instalação](docs/SETUP.md) | Requisitos, ambientes, contas e variáveis |
| [Produto e regras financeiras](docs/PRODUCT.md) | Métricas, extrato, parcelas e lembretes |
| [Arquitetura](docs/ARCHITECTURE.md) | Componentes, fluxos e decisões |
| [Contrato da API](docs/API.md) | Rotas, autenticação, exemplos e validações |
| [Banco de dados](docs/DATABASE.md) | Dicionário, migrations, índices e funções |
| [Heroes Agent](docs/AGENT.md) | Ferramentas, provedores e confirmação |
| [Operação](docs/OPERATIONS.md) | Publicação, rollback, backup e diagnóstico |
| [Qualidade](docs/QUALITY.md) | Testes, cobertura e verificação manual |
| [Segurança](SECURITY.md) | Segredos, isolamento e incidentes |
| [Contribuição](CONTRIBUTING.md) | Fluxo de trabalho e critérios de revisão |
| [Histórico](CHANGELOG.md) | Capacidades entregues em 1.0.0 |

## Funcionalidades

| Área | Comportamento |
| --- | --- |
| Dashboard | Receita bruta, custos, receita líquida, gastos pessoais e sobra; semana/mês |
| Lançamentos | Criar, editar e excluir receita/despesa |
| Extrato | Histórico, filtros, entradas, saídas e saldo acumulado |
| Contas fixas | Recorrência semanal/mensal e registro de pagamentos |
| Empréstimos | Parcelas mensais, vencimentos, pagamentos e pendências |
| Contas a negociar | Dívidas e total consolidado do perfil |
| Lembretes | Vencimentos e atrasos no Dashboard |
| Heroes Agent | Consultas e propostas limitadas à identidade autenticada |
| Experiência | Tutorial, atalhos flutuantes, calendário e selects personalizados |

## Execução rápida

Recomendado: Node.js 24 LTS e npm. Na pasta do projeto:

```sh
npm ci
```

Crie o arquivo privado de configuração. No PowerShell:

```powershell
Copy-Item .env.example .env
```

Para modo local, deixe as variáveis de Supabase vazias e crie contas de desenvolvimento em um terminal interativo:

```sh
npm run account -- Kayohan kayohan@example.test
npm run account -- Arielle arielle@example.test
```

As senhas são solicitadas sem exibição. Inicie em dois terminais:

```sh
npm run server
```

```sh
npm run dev
```

Abra http://localhost:5173. O Vite encaminha /api para a porta 3001. Sem credenciais de IA, o agente utiliza o interpretador local.

## Validação e publicação

```sh
npm test
npm run build
```

O projeto inclui configuração Vercel e entrada serverless. Produção exige Supabase, migrations 001 a 004 e contas confirmadas. Consulte os guias de instalação e operação antes de publicar.

```sh
vercel login
vercel deploy --prod
```

## Estrutura

```text
api/                    Entrada Vercel
server/                 API, autenticação e pagamentos
src/                    Interface e domínio
public/                 Ativos públicos
supabase/migrations/    Evolução SQL
tests/                  Domínio e integração local
docs/                   Documentação
.env.example            Modelo sem segredos
vercel.json             Build, roteamento e cabeçalhos
```

## Limites da versão

- Dois owners fixos; expansão exige revisão do domínio e do schema.
- Sem cadastro público ou recuperação por e-mail na interface.
- Lembretes somente no app, sem push ou pagamentos automáticos.
- Parcelas mensais de valor constante, sem cálculo de juros/amortização.
- Modo local com uma única instância; não usar em disco efêmero.
- Modelo gratuito sujeito às condições e disponibilidade do provedor.
- Sem trilha de auditoria imutável, conciliação ou exportação contábil.

## Direitos de uso

O código está público para consulta. Não foi concedida uma licença específica de reutilização: consulte o titular antes de redistribuir código, marca ou ativos. Dependências mantêm suas próprias licenças.

