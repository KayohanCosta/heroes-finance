# Configurações pessoais

Abra o avatar no cabeçalho para mostrar o menu Configurações/Sair. O menu fecha ao clicar fora, pressionar Escape ou sair pelo teclado. Nome de exibição e foto são privados e separados por perfil; não são usados para autorização. A foto selecionada é recortada ao centro, reduzida a 192×192 JPEG, sem metadados originais, e salva junto às preferências. Limite de entrada: 8 MB; foto final até 40.000 caracteres. Arquivos SVG/URLs externas não são aceitos.

Nome, foto, tema claro/escuro, período inicial, ocultação de valores no Dashboard/Lançamentos e visibilidade dos cards são persistidos por owner em `user_settings`. O backend obtém o owner da sessão, aplica validação estrita e recusa alterar outra conta. A tabela possui RLS, sem acesso para anon/authenticated; somente o servidor usa service_role. O modo local salva `data/settings.json`, ignorado pelo Git. Não há alterações nos lançamentos ao personalizar o dashboard. Outros módulos, como Extrato e Contas Fixas, continuam mostrando seus valores; a ocultação é visual, não criptografia.

E-mail de login é informativo e não editável, porque a associação de e-mails ao owner é configurada pelo administrador. Esta versão não oferece mudança automática de e-mail nem senha; não exibe botões sem implementação. Sair revoga a sessão e cancela os alarmes do aparelho; o tutorial pode ser reaberto nesta página e permanece concluído para acessos futuros.

## Android 1.2.0

Novo seletor de imagens nativo, consulta ao estado real das notificações e do bloqueio biométrico, link para as permissões de notificações do aplicativo nas configurações do Android. Ativar/desativar o bloqueio exige autenticação do sistema; cancelar não muda a preferência. Não é possível conceder permissões do sistema via JavaScript: o aplicativo solicita a permissão ou abre a tela do Android. Negar notificação não pausa e-mails. Em APKs antigos o controle de status não responde; instale o atualizado. Na versão web, controles Android não aparecem como operacionais e não há promessa de push no navegador.

Foto/nome/preferências acompanham a conta após salvar e recarregar. Permissões/biometria são locais ao aparelho. A foto é acessível apenas pelo backend autenticado e não usa URLs públicas de armazenamento. O botão flutuante não é alterado. O footer é ocultado somente até 700 px; primeiros passos e logout permanecem em Configurações.

## Verificação

Testes reais de API cobrem persistência local, acesso autenticado, isolamento entre owners, rejeição de alteração de owner e de imagem falsa. CI executa compilação web e testes; o workflow Android executa build e lint. Permissão concedida/negada, seleção de foto e biometria precisam ser conferidas no dispositivo real após instalar o APK.

O olho no card Sobra real alterna a preferência de ocultação de valores no Dashboard/Lançamentos e salva na conta. Claro/escuro é aplicado após Salvar alterações e restaurado no login. Perfis anteriores recebem tema escuro por padrão sem migration adicional. O layout de Configurações usa toda a largura disponível do conteúdo.

## Correções em 1.4.2

O tema é aplicado antes da primeira renderização a partir de uma preferência cosmética local, depois confirmado pela conta no servidor. Essa preferência não armazena dados financeiros. A página atual é preservada por perfil na sessão do navegador para voltar de permissões e seletores do Android.

Selecionar ou remover uma foto salva imediatamente o avatar no backend. Outras mudanças ainda não salvas no formulário não são enviadas por essa ação. A imagem é decodificada pelo navegador, recortada e comprimida com redução gradual; formatos inválidos ou grandes demais produzem mensagem de erro sem substituir a foto existente.

O status do aparelho é consultado novamente ao retornar ao app e ao abrir Configurações. A permissão real continua sendo do Android; nenhuma preferência no backend simula uma autorização.
