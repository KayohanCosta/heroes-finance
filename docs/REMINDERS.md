# Lembretes programados

## Uso

A aba **Lembretes** permite cadastrar, editar, pausar, retomar e excluir atÃ© 50 lembretes por perfil. RepetiÃ§Ãµes disponÃ­veis: uma vez, diariamente, dias da semana e mensalmente. Todo horÃ¡rio usa `America/Sao_Paulo`, independentemente do fuso do navegador. No formato mensal, o dia original Ã© preservado: dia 31 vira o Ãºltimo dia de fevereiro e volta a 31 em marÃ§o.

Exemplos para o Heroes Agent:

- `Me lembrar de beber Ã¡gua todo dia Ã s 8:00`.
- `Me lembrar de revisar as contas amanhÃ£ Ã s 19h`.
- `Me lembrar de pagar a conta dia 10/12/2026 Ã s 9:30 pelo e-mail`.

Os exemplos sÃ£o convertidos em uma proposta, sem salvar ou enviar nada antes da confirmaÃ§Ã£o. O horÃ¡rio e a repetiÃ§Ã£o sÃ£o validados por cÃ³digo. Frases mais variadas podem usar as ferramentas do modelo conectado. Sem indicaÃ§Ã£o de canal, o padrÃ£o Ã© aplicativo; conteÃºdo discreto Ã© ativado por padrÃ£o. Nenhuma ferramenta pode definir outro owner ou endereÃ§o de destinatÃ¡rio.

## Aplicativo Android

Ã‰ necessÃ¡rio instalar o APK versÃ£o 1.1.0 ou posterior para os horÃ¡rios personalizados. APKs antigos continuam recebendo somente vencimentos financeiros Ã s 9h. A interface web nÃ£o produz notificaÃ§Ãµes Android sozinha.

Os lembretes pessoais dos prÃ³ximos 60 dias sÃ£o agendados no aparelho junto dos vencimentos financeiros. A sincronizaÃ§Ã£o ocorre com os dados carregados, em qualquer aba. HÃ¡ um limite de 450 ocorrÃªncias pessoais e 500 avisos no total; sÃ£o priorizados os mais prÃ³ximos. Muitos lembretes diÃ¡rios exigem abrir o app com maior frequÃªncia para renovar a agenda. O Android pode atrasar alarmes por economia de bateria; nÃ£o hÃ¡ garantia de pontualidade ao minuto.

Pausar, editar, excluir ou sair da conta atualiza/cancela os alarmes neste aparelho. MudanÃ§as em outro aparelho sÃ³ se refletem ao abrir este app conectado. Reiniciar reprograma a agenda armazenada; forÃ§ar a parada, desinstalar ou negar notificaÃ§Ãµes pode impedir entregas. A agenda local pode funcionar sem internet depois de sincronizada, mas CRUD e autenticaÃ§Ã£o precisam do servidor.

**Ocultar detalhes** substitui tÃ­tulo/conteÃºdo por uma mensagem genÃ©rica no Android e no e-mail. Desativar essa opÃ§Ã£o permite que o tÃ­tulo apareÃ§a no aviso e seja transmitido ao provedor de e-mail. O bloqueio nativo e os ajustes de privacidade do prÃ³prio sistema continuam relevantes.

## Configurar e-mail

### Gmail: sem comprar domínio

Para uso pessoal, configure `REMINDER_EMAIL_PROVIDER=gmail`, `GMAIL_USER` (uma conta `@gmail.com`) e `GMAIL_APP_PASSWORD` como segredo **somente no servidor/Vercel**. A senha de app é gerada pelo próprio usuário em https://myaccount.google.com/apppasswords, após ativar verificação em duas etapas. Não utilize a senha normal, não envie a credencial por chat e não a coloque no GitHub. Algumas contas não permitem senhas de app; veja a [documentação do Google](https://support.google.com/accounts/answer/185833?hl=pt-BR).

O remetente é a conta Gmail configurada, com nome Heroes Finance. Nenhum domínio ou plano pago é contratado. Gmail impõe limites e pode bloquear envio automatizado; este modo é destinado ao baixo volume dos dois perfis, sem SLA. Os destinatários continuam fixos por owner. Sem credenciais, o canal permanece indisponível. Após configurar, faça novo deploy, crie um lembrete futuro de teste e confira recebimento e pasta de spam.

A conexão SMTP usa TLS obrigatório em `smtp.gmail.com:465`, validação de certificado, sem logs de autenticação, leitura de arquivos ou URLs. Mensagens recebem ID estável por ocorrência. SMTP **não oferece a idempotência do Resend**: uma falha ambígua pode ocorrer depois da aceitação. Por isso falhas de envio Gmail são encerradas, sem novas tentativas automáticas. Uma queda do processo depois da aceitação ainda pode gerar duplicidade quando o lease expira. `sent` significa aceito pelo servidor, não entregue/lido. Resend continua opcional, sem fallback automático que misture remetentes.

### Resend: domínio verificado

O envio estÃ¡ integrado ao Resend, mas permanece indisponÃ­vel na interface enquanto as variÃ¡veis abaixo estiverem ausentes. NÃ£o hÃ¡ conta Resend ou domÃ­nio criado automaticamente. Ã‰ preciso:

1. Criar uma conta Resend.
2. Adicionar um domÃ­nio que vocÃª controla e verificar seus registros DNS.
3. Criar uma chave de envio e configurar **somente no servidor**:

```dotenv
RESEND_API_KEY=
REMINDER_FROM=Heroes Finance <lembretes@example.test>
REMINDER_CRON_SECRET=
```

`example.test` Ã© ilustrativo; substitua por um remetente real do domÃ­nio verificado. Os destinatÃ¡rios vÃªm exclusivamente de `KAYOHAN_EMAIL` e `ARIELLE_EMAIL`, jÃ¡ usados na autenticaÃ§Ã£o. NÃ£o sÃ£o enviados para endereÃ§os escolhidos pela IA ou recebidos no corpo da requisiÃ§Ã£o. NÃ£o use prefixo `VITE_` para nenhuma chave. ApÃ³s configurar na Vercel, faÃ§a novo deploy para carregar as variÃ¡veis e habilitar a opÃ§Ã£o de e-mail.

Sem configuraÃ§Ã£o, o servidor registra a ocorrÃªncia como `unconfigured` e nÃ£o envia. Ativar o serviÃ§o posteriormente nÃ£o dispara e-mails antigos em massa: somente ocorrÃªncias futuras e tentativas ainda elegÃ­veis sÃ£o processadas.

DocumentaÃ§Ã£o do provedor: [domÃ­nio verificado](https://resend.com/docs/dashboard/domains/introduction), [API e idempotÃªncia](https://resend.com/docs/api-reference/emails/send-email).

## Agendamento no servidor

As migrations `20261007001204_scheduled_reminders.sql` e `20261007001719_reminder_dispatch_cron.sql` criam as tabelas, funÃ§Ãµes e dispatcher. O Supabase Cron verifica a agenda a cada minuto. SÃ³ chama a Vercel quando hÃ¡ ocorrÃªncia ou tentativa pendente. NÃ£o usa cron diÃ¡rio do plano Hobby da Vercel nem depende de um navegador aberto.

O endpoint `POST /api/internal/reminders/run` exige um Bearer token aleatÃ³rio, comparado em tempo constante. O token deve coincidir com `REMINDER_CRON_SECRET` na Vercel e o segredo `heroes_reminder_cron_token` no Supabase Vault. O Vault tambÃ©m precisa de `heroes_reminder_cron_url`, apontando para o endpoint do seu domÃ­nio de produÃ§Ã£o. Esses valores nÃ£o sÃ£o publicados no repositÃ³rio, em migrations ou na interface.

As tabelas possuem RLS e acesso revogado para `anon` e `authenticated`. Somente o backend com service role pode acessÃ¡-las; o backend vincula as rotas ao owner da sessÃ£o. As funÃ§Ãµes de claim/lease usam `SECURITY INVOKER` e tÃªm execuÃ§Ã£o revogada para roles pÃºblicas. O dispatcher fica em schema privado e Ã© executado pelo job do banco.

## ConcorrÃªncia, falhas e limites

- Um claim atÃ´mico compara ID, revisÃ£o e horÃ¡rio, avanÃ§a a agenda e insere uma ocorrÃªncia Ãºnica.
- Cada ediÃ§Ã£o/pausa troca a revisÃ£o; trabalhos antigos sÃ£o cancelados antes do envio. Um envio jÃ¡ aceito pelo provedor nÃ£o pode ser recolhido.
- O servidor ignora ocorrÃªncias atrasadas mais de 24 horas e avanÃ§a para a prÃ³xima futura, evitando uma enxurrada de avisos apÃ³s indisponibilidade.
- A fila usa leases de dois minutos, `SKIP LOCKED` e atÃ© seis tentativas com intervalo crescente.
- Todas as tentativas da mesma ocorrÃªncia usam a mesma chave de idempotÃªncia do Resend. Expiram em 20 horas, dentro da janela de 24 horas do provedor.
- `sent` indica aceitaÃ§Ã£o pelo Resend, nÃ£o confirmaÃ§Ã£o de leitura ou chegada Ã  caixa de entrada. NÃ£o hÃ¡ webhook de entrega implementado.
- Cada execuÃ§Ã£o processa atÃ© 50 vencimentos e respeita um orÃ§amento de tempo para o envio. Volume alto pode atrasar avisos; nÃ£o existe SLA de entrega.
- Em desenvolvimento local, CRUD e propostas funcionam em arquivo JSON. O dispatcher de e-mail requer Supabase; nÃ£o inicia um processo de cron oculto no computador.

Para inspecionar, use `cron.job_run_details`, as respostas HTTP em `net._http_response` e `reminder_deliveries`, sem exportar payloads ou endereÃ§os para logs pÃºblicos. A fila nÃ£o tem limpeza automÃ¡tica nesta versÃ£o; defina retenÃ§Ã£o conforme o uso antes de expandir para muitos usuÃ¡rios.

## VerificaÃ§Ã£o

Os testes cobrem interpretaÃ§Ã£o de frases, horÃ¡rio de BrasÃ­lia, dias da semana, meses curtos, canais invÃ¡lidos, isolamento de owners, ocultaÃ§Ã£o de conteÃºdo, idempotÃªncia do provedor e CRUD real na API local. A compilaÃ§Ã£o Android e Lint sÃ£o executados pelo workflow APK Android. Entrega real de e-mail depende da configuraÃ§Ã£o e deve ser validada apÃ³s ativaÃ§Ã£o. NotificaÃ§Ãµes e biometria exigem validaÃ§Ã£o no aparelho.


## Conclusoes, adiamentos e historico (APK 1.4.5)

A Dashboard mantem a primeira ocorrencia nao concluida de cada lembrete. Enviar o aviso nao conclui a tarefa. Marcar como feito salva titulo, ocorrencia e horario da confirmacao no perfil autenticado. Na aba Lembretes, o historico exibe as 50 confirmacoes mais recentes e permite desfazer a ultima de cada lembrete. Mantemos ate 500 confirmacoes por lembrete; excluir o lembrete remove seu historico.

Adiar oferece 10 minutos, 1 hora ou data e horario em Brasilia, nos proximos sete dias. Adiar nao conclui a tarefa. Editar ou pausar a programacao cancela o adiamento anterior.

Notificacoes de rotina no APK 1.4.5 oferecem Feito e Adiar 10 min sem abrir o app. Exigem sessao valida, conexao e desbloqueio quando necessario. O servidor valida proprietario e ocorrencia. A notificacao so desaparece depois de salvar; falhas deixam o lembrete pendente. Ao voltar ao app, os dados sao atualizados. Avisos genericos de contas e notificacoes de teste nao possuem essas acoes.
