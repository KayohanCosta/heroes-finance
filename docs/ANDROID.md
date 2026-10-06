# Heroes Finance para Android

## Distribuição

O projeto inclui um aplicativo Android nativo que abre exclusivamente `https://heroesfinance.vercel.app`. Não depende da Google Play. A interface e a autenticação continuam no servidor. É necessário acesso à internet. Não existe sincronização offline de lançamentos.

A opção por WebView nativa mantém os cookies de sessão na mesma origem do site; não há chaves de Supabase ou OpenRouter no APK, nem alteração para autenticação por credenciais salvas em JavaScript. Capacitor não é utilizado nesta versão.

## Gerar o APK de teste

No GitHub, abra **Actions → APK Android → Run workflow**. Após a execução bem-sucedida, baixe o artefato `heroes-finance-apk-teste`, extraia o ZIP e transfira `app-debug.apk` para o celular. Abra o arquivo e permita a instalação pela aplicação usada para abri-lo. Essa permissão é do Android, não da Google Play.

O workflow executa compilação e Android Lint antes de disponibilizar o arquivo. Um workflow ainda não concluído não comprova que o APK funciona. A versão de teste usa assinatura debug: diferentes ambientes podem gerar assinaturas diferentes, exigindo desinstalação antes de instalar outra versão. Uma distribuição definitiva exige uma chave de assinatura privada estável, mantida fora do repositório. Não há chave privada de assinatura publicada.

Para compilar localmente: Java 17, Gradle 8.9 e SDK Android 35. Dentro de `android`, execute `gradle assembleDebug lintDebug`. O resultado fica em `app/build/outputs/apk/debug/app-debug.apk`. Requer Android 8 ou posterior e Android System WebView atualizado.

## Bloqueio

No Dashboard do APK, selecione **Ativar biometria**. A ativação só é salva após autenticação bem-sucedida pelo sistema. Android 11 ou posterior permite também credencial de bloqueio do aparelho. Em versões anteriores, requer biometria forte cadastrada.

A proteção é deste aparelho, não substitui a senha da conta. Ao abrir ou retornar ao aplicativo, uma camada nativa oculta os dados até o desbloqueio. Cancelar mantém a camada bloqueada. Capturas de tela e prévias de aplicativos recentes são protegidas por `FLAG_SECURE`. O aplicativo não recebe nem armazena impressões digitais. Desinstalar limpa a configuração e a sessão local.

## Lembretes

Selecione **Permitir lembretes** no Dashboard. No Android 13 ou posterior, aceite a permissão do sistema. Contas mensais, semanais e parcelas não pagas agendam lembretes para os próximos 60 dias. Cada data gera uma notificação genérica, sem credor, descrição, perfil ou valor na tela bloqueada. O horário previsto é 9h em America/Sao_Paulo. Não são solicitadas permissões de alarme exato: economia de bateria e políticas do fabricante podem atrasar a entrega.

Abrir o app com os dados carregados recalcula e substitui a agenda. Pagamentos e exclusões se refletem após a atualização dos dados. Sair da conta ou perder a sessão cancela a agenda. Reiniciar o aparelho reprograma os lembretes futuros armazenados. O aplicativo não consulta o servidor em segundo plano: alterações feitas em outro aparelho precisam ser sincronizadas abrindo este APK. Não há promessa de lembretes após 60 dias sem abrir o aplicativo, após forçar sua parada ou negar notificações.

## Segurança da ponte nativa

A ponte usa AndroidX WebKit `addWebMessageListener`, aceita somente a origem HTTPS de produção e rejeita mensagens de subframes. Navegações para outros domínios são bloqueadas. Acesso a arquivos, conteúdo local, cookies de terceiros e conteúdo misto estão desabilitados. Não existe ponte `addJavascriptInterface` irrestrita. Se o WebView não suportar a ponte, o site continua disponível, mas as opções nativas não aparecem.

## Validação em aparelho antes da distribuição

- Instalar, entrar nas duas contas separadamente e confirmar isolamento.
- Ativar proteção, minimizar, retornar, cancelar e repetir desbloqueio.
- Negar e depois permitir notificações nas configurações do sistema.
- Criar vencimento futuro, pagar, sair e verificar atualização/cancelamento.
- Reiniciar o aparelho, verificar lembrete e abrir por sua notificação.
- Testar perda de internet, teclado, calendário e botão Voltar.

Essas verificações exigem um aparelho ou emulador Android e não são substituídas pelo build ou Lint.

## Horários personalizados — versão 1.1.0

O APK 1.1.0 adiciona lembretes pessoais com horário escolhido, conteúdo discreto e repetição. A sincronização funciona em qualquer aba. Instale a nova versão para receber esses avisos; o APK 1.0.0 continua limitado aos vencimentos às 9h. Veja [Lembretes programados](REMINDERS.md) para configuração de e-mail e limites da agenda local.

