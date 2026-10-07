# Lembretes programados

## Uso

A aba **Lembretes** permite cadastrar, editar, pausar, retomar e excluir até 50 lembretes por perfil. Repetições disponíveis: uma vez, diariamente, dias da semana e mensalmente. Todo horário usa `America/Sao_Paulo`, independentemente do fuso do navegador. No formato mensal, o dia original é preservado: dia 31 vira o último dia de fevereiro e volta a 31 em março.

Exemplos para o Heroes Agent:

* `Me lembrar de beber água todo dia às 8:00`.
* `Me lembrar de revisar as contas amanhã às 19h`.
* `Me lembrar de pagar a conta dia 10/12/2026 às 9:30 pelo e-mail`.

Os exemplos são convertidos em uma proposta, sem salvar ou enviar nada antes da confirmação. O horário e a repetição são validados por código. Frases mais variadas podem usar as ferramentas do modelo conectado. Sem indicação de canal, o padrão é aplicativo; conteúdo discreto é ativado por padrão. Nenhuma ferramenta pode definir outro owner ou endereço de destinatário.

## Aplicativo Android

É necessário instalar o APK versão 1.1.0 ou posterior para os horários personalizados. APKs antigos continuam recebendo somente vencimentos financeiros às 9h. A interface web não produz notificações Android sozinha.

Os lembretes pessoais dos próximos 60 dias são agendados no aparelho junto dos vencimentos financeiros. A sincronização ocorre com os dados carregados, em qualquer aba. Há um limite de 450 ocorrências pessoais e 500 avisos no total; são priorizados os mais próximos. Muitos lembretes diários exigem abrir o app com maior frequência para renovar a agenda. O Android pode atrasar alarmes por economia de bateria; não há garantia de pontualidade ao minuto.

Pausar, editar, excluir ou sair da conta atualiza/cancela os alarmes neste aparelho. Mudanças em outro aparelho só se refletem ao abrir este app conectado. Reiniciar reprograma a agenda armazenada; forçar a parada, desinstalar ou negar notificações pode impedir entregas. A agenda local pode funcionar sem internet depois de sincronizada, mas CRUD e autenticação precisam do servidor.

**Ocultar detalhes** substitui título/conteúdo por uma mensagem genérica no Android e no e-mail. Desativar essa opção permite que o título apareça no aviso e seja transmitido ao provedor de e-mail. O bloqueio nativo e os ajustes de privacidade do próprio sistema continuam relevantes.

## Configurar e-mail

### Gmail: sem comprar domínio

Para uso pessoal, configure `REMINDER_EMAIL_PROVIDER=gmail`, `GMAIL_USER` (uma conta `@gmail.com`) e `GMAIL_APP_PASSWORD` como segredo **somente no servidor/Vercel**. A senha de app é gerada pelo próprio usuário em [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords), após ativar verificação em duas etapas. Não utilize a senha normal, não envie a credencial por chat e não a coloque no GitHub. Algumas contas não permitem senhas de app; veja a [documentação do Google](https://www.google.com/search?q=https%3A%2F%2Fsupport.google.com%2Faccounts%2Fanswer%2F185833%3Fhl%3Dpt).

O remetente é a conta Gmail configurada, com nome Heroes Finance. Nenhum domínio ou plano pago é contratado. Gmail impõe limites e pode bloquear envio automatizado; este modo é destinado ao baixo volume dos dois perfis, sem SLA. Os destinatários continuam fixos por owner. Sem credenciais, o canal permanece indisponível. Após configurar, faça novo deploy, crie um lembrete futuro de teste e confira recebimento e pasta de spam.

A conexão SMTP usa TLS obrigatório em `smtp.gmail.com:465`, validação de certificado, sem logs de autenticação, leitura de arquivos ou URLs. Mensagens recebem ID estável por ocorrência. SMTP **não oferece a idempotência do Resend**: uma falha ambígua pode ocorrer depois da aceitação. Por isso falhas de envio Gmail são encerradas, sem novas tentativas automáticas. Uma queda do processo depois da aceitação ainda pode gerar duplicidade quando o lease expira. `sent` significa aceito pelo servidor, não entregue/lido. Resend continua opcional, sem fallback automático que misture remetentes.

### Resend: domínio verificado

O envio está integrado ao Resend, mas permanece indisponível na interface enquanto as variáveis abaixo estiverem ausentes. Não há conta Resend ou domínio criado automaticamente. É preciso:

1. Criar uma conta Resend.
2. Adicionar um domínio que você controla e verificar seus registros DNS.
3. Criar uma chave de envio e configurar **somente no servidor**:

```dotenv
RESEND_API_KEY=
REMINDER_FROM=Heroes Finance <lembretes@example.test>
REMINDER_CRON_SECRET=

```

`example.test` é ilustrativo; substitua por um remetente real do domínio verificado. Os destinatários vêm exclusivamente de `KAYOHAN_EMAIL` e `ARIELLE_EMAIL`, já usados na autenticação. Não são enviados para endereços escolhidos pela IA ou recebidos no corpo da requisição. Não use prefixo `VITE_` para nenhuma chave. Após configurar na Vercel, faça novo deploy para carregar as variáveis e habilitar a opção de e-mail.

Sem configuração, o servidor registra a ocorrência como `unconfigured` e não envia. Ativar o serviço posteriormente não dispara e-mails antigos em massa: somente ocorrências futuras e tentativas ainda elegíveis são processadas.

Documentação do provedor: [domínio verificado](https://resend.com/docs/dashboard/domains/introduction), [API e idempotência](https://resend.com/docs/api-reference/emails/send-email).

## Agendamento no servidor

As migrations `20261007001204_scheduled_reminders.sql` e `20261007001719_reminder_dispatch_cron.sql` criam as tabelas, funções e dispatcher. O Supabase Cron verifica a agenda a cada minuto. Só chama a Vercel quando há ocorrência ou tentativa pendente. Não usa cron diário do plano Hobby da Vercel nem depende de um navegador aberto.

O endpoint `POST /api/internal/reminders/run` exige um Bearer token aleatório, comparado em tempo constante. O token deve coincidir com `REMINDER_CRON_SECRET` na Vercel e o segredo `heroes_reminder_cron_token` no Supabase Vault. O Vault também precisa de `heroes_reminder_cron_url`, apontando para o endpoint do seu domínio de produção. Esses valores não são publicados no repositório, em migrations ou na interface.

As tabelas possuem RLS e acesso revogado para `anon` e `authenticated`. Somente o backend com service role pode acessá-las; o backend vincula as rotas ao owner da sessão. As funções de claim/lease usam `SECURITY INVOKER` e têm execução revogada para roles públicas. O dispatcher fica em schema privado e é executado pelo job do banco.

## Concorrência, falhas e limites

* Um claim atômico compara ID, revisão e horário, avança a agenda e insere uma ocorrência única.
* Cada edição/pausa troca a revisão; trabalhos antigos são cancelados antes do envio. Um envio já aceito pelo provedor não pode ser recolhido.
* O servidor ignora ocorrências atrasadas mais de 24 horas e avança para a próxima futura, evitando uma enxurrada de avisos após indisponibilidade.
* A fila usa leases de dois minutos, `SKIP LOCKED` e até seis tentativas com intervalo crescente.
* Todas as tentativas da mesma ocorrência usam a mesma chave de idempotência do Resend. Expiram em 20 horas, dentro da janela de 24 horas do provedor.
* `sent` indica aceitação pelo Resend, não confirmação de leitura ou chegada à caixa de entrada. Não há webhook de entrega implementado.
* Cada execução processa até 50 vencimentos e respeita um orçamento de tempo para o envio. Volume alto pode atrasar avisos; não existe SLA de entrega.
* Em desenvolvimento local, CRUD e propostas funcionam em arquivo JSON. O dispatcher de e-mail requer Supabase; não inicia um processo de cron oculto no computador.

Para inspecionar, use `cron.job_run_details`, as respostas HTTP em `net._http_response` e `reminder_deliveries`, sem exportar payloads ou endereços para logs públicos. A fila não tem limpeza automática nesta versão; defina retenção conforme o uso antes de expandir para muitos usuários.

## Verificação

Os testes cobrem interpretação de frases, horário de Brasília, dias da semana, meses curtos, canais inválidos, isolamento de owners, ocultação de conteúdo, idempotência do provedor e CRUD real na API local. A compilação Android e Lint são executados pelo workflow APK Android. Entrega real de e-mail depende da configuração e deve ser validada após ativação. Notificações e biometria exigem validação no aparelho.

## Conclusões, adiamentos e histórico (APK 1.4.5)

A Dashboard mantém a primeira ocorrência não concluída de cada lembrete. Enviar o aviso não conclui a tarefa. Marcar como feito salva título, ocorrência e horário da confirmação no perfil autenticado. Na aba Lembretes, o histórico exibe as 50 confirmações mais recentes e permite desfazer a última de cada lembrete. Mantemos até 500 confirmações por lembrete; excluir o lembrete remove seu histórico.

Adiar oferece 10 minutos, 1 hora ou data e horário em Brasília, nos próximos sete dias. Adiar não conclui a tarefa. Editar ou pausar a programação cancela o adiamento anterior.

Notificações de rotina no APK 1.4.5 oferecem Feito e Adiar 10 min sem abrir o app. Exigem sessão válida, conexão e desbloqueio quando necessário. O servidor valida proprietário e ocorrência. A notificação só desaparece depois de salvar; falhas deixam o lembrete pendente. Ao voltar ao app, os dados são atualizados. Avisos genéricos de contas e notificações de teste não possuem essas ações.
