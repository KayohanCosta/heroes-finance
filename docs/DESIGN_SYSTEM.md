# Sistema visual Heroes Finance

O sistema mantém Inter nos títulos, descrições, ações e rótulos. JetBrains Mono é reservada a quantias, horários e datas, com números alinhados para facilitar a leitura financeira.

## Fonte central

`src/design-system.css` é carregado após os estilos dos componentes. Define tokens para fundo, superfície, borda, texto, texto auxiliar, âmbar e raio. Os estilos específicos de funcionalidades continuam em `src/style.css`; futuras decisões transversais devem usar os tokens `--hf-*`.

O tema claro usa superfícies brancas sobre fundo cinza frio; o escuro usa superfícies azuladas discretas. Ambos mantêm hierarquia, dimensões, foco visível e uma ação principal âmbar. Verde identifica resultado positivo ou confirmação; vermelho identifica saídas e ações destrutivas. A cor deve ser acompanhada de texto.

## Organização das telas

- Dashboard: indicadores do período primeiro; agenda e vencimentos em duas colunas no desktop; fluxo e assistente em seguida. Configurações de visibilidade preservam o fluxo quando um card é ocultado.
- Lançamentos: tabela no desktop e registros individuais em duas colunas no mobile, com descrição, categoria, área, valor e ações legíveis.
- Extrato: filtros, indicadores e saldo continuam usando os mesmos cálculos. No mobile, cada movimento tem campos identificados e saldo acumulado em destaque.
- Contas Fixas e Empréstimos: tipografia, raio, espaçamento e ações compartilham o padrão. Detalhes de vencimentos continuam expansíveis.
- Contas a negociar: total e quantias usam a fonte numérica; observações usam a fonte de interface.
- Lembretes: o horário e o estado têm hierarquia própria. As ações aparecem quando a ocorrência pode ser confirmada.
- Configurações: perfil e preferências ficam lado a lado em telas amplas; as permissões do aparelho mantêm seus controles e status reais.
- Login e modais: campos maiores, espaçamento consistente e foco visível; o efeito animado da borda do login permanece.

## Responsividade e acessibilidade

As tabelas recebem rótulos por célula em `data-label`, exibidos na apresentação mobile. Cabeçalhos permanecem disponíveis sem ocupar espaço visual. Os botões mantêm nomes acessíveis e as operações continuam vinculadas ao perfil autenticado. O sistema respeita a preferência de reduzir movimento. A navegação mobile mantém as cinco seções e área segura inferior. O flutuante Heroes mantém seu comportamento de arraste.

## Validação

Verificar desktop e mobile nos dois temas; navegar por todas as seções; abrir e cancelar formulários; conferir filtros e menus; verificar que quantias e títulos longos não provocam rolagem horizontal da página. A refatoração visual não altera o banco, autenticação, agenda Android ou transporte de e-mail.
