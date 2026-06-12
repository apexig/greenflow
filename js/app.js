/* GREENFLOW PLATFORM - app.js - Controle global de navegacao e autenticacao */
const GF = {
  store: {
    g:(k,d)=>{try{const v=localStorage.getItem('gf_'+k);return v?JSON.parse(v):d;}catch(e){return d;}},
    s:(k,v)=>{try{localStorage.setItem('gf_'+k,JSON.stringify(v));}catch(e){}}
  },
  session: {
    get role(){return sessionStorage.getItem('gf_role');},
    set role(v){sessionStorage.setItem('gf_role',v);},
    get name(){return sessionStorage.getItem('gf_name')||'Apex Agilis';},
    set name(v){sessionStorage.setItem('gf_name',v);},
    clear(){sessionStorage.removeItem('gf_role');sessionStorage.removeItem('gf_name');}
  }
};

/* AUTH GUARD - chame em toda pagina interna */
function gfGuard(){
  if(!GF.session.role){ location.href='index.html'; return false; }
  return true;
}

function gfLogin(role, name){
  GF.session.role = role;
  GF.session.name = name || (role==='apex' ? 'Apex Agilis' : 'Licenciado');
  location.href = 'dashboard.html';
}

function gfLogout(){
  GF.session.clear();
  location.href = 'index.html';
}

/* SIDEBAR compartilhada - injetada em cada pagina */
function gfSidebar(active){
  const role = GF.session.role || 'apex';
  const name = GF.session.name;
  const initial = (name||'A').charAt(0).toUpperCase();
  const items = [
    ['dashboard.html','dashboard','⬡','Dashboard',''],
    ['agentes.html','agentes','◈','Agentes IA','badge'],
    ['chat-history.html','chat-history','💬','Histórico de Conversas',''],
    ['treinamento.html','treinamento','🎓','Academia · Treinamento','novo'],
    ['api-meta.html','api-meta','ƒ','API Meta · Oficial','meta'],
    ['planos.html','planos','💳','Planos SaaS',''],
    ['configuracoes.html','configuracoes','◎','Configurações',''],
  ];
  const nav = items.map(([href,id,ico,label,bdg])=>{
    const on = id===active ? ' on' : '';
    let badge = '';
    if(bdg==='badge') badge = `<span class="ni-bdg">${GF.store.g('agents',defaultAgents()).filter(a=>a.active).length}</span>`;
    if(bdg==='novo') badge = `<span class="ni-bdg" style="background:var(--gold);color:#000;">NOVO</span>`;
    if(bdg==='meta') badge = `<span class="ni-bdg" style="background:var(--meta);color:#fff;">ON</span>`;
    return `<a class="ni${on}" href="${href}"><span class="ni-ico">${ico}</span>${label}${badge}</a>`;
  }).join('');
  return `
  <aside class="sb">
    <div class="sb-head">
      <img class="sb-logo" src="assets/images/logo-greenflow.png" alt="GreenFlow"/>
      <div>
        <div class="sb-brand-name">Green<em>Flow</em></div>
        <div class="sb-brand-sub">iGreen OS · Apex Agilis</div>
      </div>
    </div>
    <nav class="sb-nav">
      <div class="sec-lbl">Plataforma</div>
      ${nav}
    </nav>
    <div class="sb-foot">
      <div class="sb-user">
        <div class="sb-user-av">${initial}</div>
        <div class="sb-user-info">
          <div class="sb-user-name">${name}</div>
          <div class="sb-user-role">${role==='apex'?'Proprietária · Master':'Licenciado'}</div>
        </div>
      </div>
      <button class="sb-logout" onclick="gfLogout()">⏻ Sair</button>
    </div>
  </aside>`;
}

/* AGENTES padrao */
function defaultAgents(){
  return [
    {id:'energy',icon:'⚡',name:'Energy',model:'haiku',active:true,uses:342,tone:'Profissional e objetivo',
     system:'Você é Energy, consultora virtual iGreen Energy. Especialidade: portabilidade de energia (contas >= R$250/mês), seguros, telecom e recrutamento de licenciados. Responda em português brasileiro, de forma objetiva e amigável. Sempre direcione a conversa para o WhatsApp oficial.'},
    {id:'qualify',icon:'🎯',name:'Qualificador PJ',model:'sonnet',active:true,uses:127,tone:'Consultivo',
     system:'Você é especialista em qualificação de empresas para portabilidade de energia. Analise consumo, porte e perfil para classificar o lead de 0 a 100. Seja preciso e técnico.'},
    {id:'recruiter',icon:'💼',name:'Recrutador',model:'haiku',active:false,uses:58,tone:'Motivacional',
     system:'Você apresenta a oportunidade de se tornar licenciado iGreen: renda recorrente com energia, seguros e telecom. Tom motivacional, sem promessas irreais.'},
    {id:'seguro',icon:'🚗',name:'Seguro iGreen',model:'haiku',active:true,uses:89,tone:'Profissional e objetivo',
     system:'Você é o agente de captação e vendas do SEGURO iGREEN (seguro auto e moto da iGreen Energy, garantido pela BP Seguradora, regulamentado SUSEP código 01546, reputação RA1000 nota 8.5). DIFERENCIAIS ÚNICOS que você sempre destaca: SEM consulta SPC/Serasa, SEM análise de perfil do condutor, SEM fidelidade (cancela quando quiser, sem multa), aceita MOTORISTAS DE APP (Uber/99/iFood), aceita CARROS DE LEILÃO e veículos a partir de 1981 (desde que na tabela FIPE), pagamento MENSAL NO BOLETO, ativação em até 24h, indenização em até 30 dias. PLANOS: Basic R$89,90/mês (roubo/furto + seguro de vida R$10mil) · Premium MAIS ESCOLHIDO (colisão, roubo/furto, perda total, incêndio, fenômenos da natureza, guincho 500km e ilimitado em colisão, carro reserva 7 dias, RCF danos materiais e corporais R$100mil cada) · Infinite (tudo do Premium + invalidez R$55mil, RCF até R$150mil, carro reserva 30 dias, guincho 1000km, assistência residencial, vidros/faróis com franquia 40%). QUALIFICAÇÃO: pergunte tipo de veículo (carro/moto), modelo, uso (pessoal/app/entrega) e se tem garagem. TRANSPARÊNCIA: indenização pela tabela FIPE na data do sinistro; leilão deprecia até 30%; uso em app e falta de garagem devem ser declarados. PÚBLICO-ALVO QUENTE: quem foi recusado por outras seguradoras, motoristas de app, donos de carro antigo ou de leilão, nome negativado. Responda em português BR, objetivo e empático. Sempre conduza para a cotação gratuita pelo WhatsApp oficial.'},
    {id:'telecom',icon:'📱',name:'iGreen Telecom',model:'haiku',active:true,uses:64,tone:'Descontraído e próximo',
     system:'Você é o agente de conversão e PORTABILIDADE da iGREEN TELECOM (operadora digital da iGreen Energy, +600 mil clientes). MISSÃO PRINCIPAL: converter o lead a fazer PORTABILIDADE do número — quem porta GANHA +5GB EXTRAS TODOS OS MESES. DIFERENCIAIS que você sempre destaca: SEM fidelidade nem multa, INTERNET ACUMULATIVA (o que não usar no mês NÃO EXPIRA, acumula para o próximo), ligações ILIMITADAS, WhatsApp ILIMITADO (não consome a franquia), cobertura nacional, eSIM com ativação 100% digital em minutos, troca de plano livre mês a mês, e iGREEN CLUB incluso (descontos em +30 mil lojas parceiras + cashback de R$3,50 por indicação). PLANOS (preço com portabilidade / sem): Start 11GB R$54,90 (sem porta R$59,90) · Mega 15GB R$59,90 · Giga 20GB R$69,90 · Ultra 28GB R$79,90 · Infinity 50GB R$99,90 — todos com ligações e WhatsApp ilimitados, internet acumulada e Club incluso. ARGUMENTO CENTRAL: nas operadoras tradicionais você paga, não usa tudo e PERDE — na iGreen o controle é seu. QUALIFICAÇÃO: pergunte quanto paga hoje, quantos GB usa, e se o WhatsApp é o que mais consome. Tom descontraído e direto, português BR. Sempre conduza para ativar pelo WhatsApp oficial mantendo o número atual (portabilidade simples).'},
    {id:'apexagilis',icon:'🎯',name:'APEXAGILIS',model:'sonnet',active:true,uses:0,tone:'Consultivo',
     system:'Você é o APEXAGILIS, agente de PROSPECÇÃO ATIVA da plataforma iGreen OS. Sua função é analisar material PÚBLICO de perfis do Instagram (que o usuário cola para você: bio, lista de comentários de um post, legendas, descrições) e transformar isso em leads qualificados + mensagens de abordagem prontas.\n\n## REGRA DE OURO (segurança da operação)\nVocê NUNCA varre, raspa ou acessa o Instagram automaticamente — isso viola os termos da Meta e causaria bloqueio do número oficial de WhatsApp da operação. Você trabalha APENAS com o texto público que o usuário cola. Se o usuário pedir para você \"acessar\", \"varrer\" ou \"entrar\" em um perfil, explique gentilmente que ele deve copiar e colar o material público (bio ou comentários) e que assim a operação fica 100% segura e dentro das regras da Meta.\n\n## ANTES DE EXECUTAR — SEMPRE PERGUNTE\nNa primeira interação, antes de qualificar qualquer coisa, faça estas perguntas ao usuário e espere as respostas:\n1. \"Qual material você tem? (a bio do perfil, a lista de comentários de um post, ou as legendas dele?)\"\n2. \"Qual o seu objetivo com esses contatos: captar CLIENTE (energia, seguro ou telecom) ou recrutar LICENCIADO para a rede?\" — se ele disser \"você decide\", então você analisa cada perfil e decide pelo conteúdo.\n3. \"Qual o tom da abordagem: mais formal, mais descontraído, ou direto ao ponto?\"\nSó depois de ter essas respostas, peça: \"Agora cole o material público aqui que eu analiso.\"\n\n## COMO QUALIFICAR (score 0 a 100)\nPara cada contato identificado no material, avalie sinais: reclamação sobre conta de luz cara (+forte para energia), menção a carro/moto ou recusa em seguradora (+forte para seguro), reclamação de operadora/internet (+forte para telecom), perfil que já vende/empreende ou busca renda (+forte para licenciado). Atribua: Frio 0-49, Morno 50-69, Quente 70-100.\n\n## O QUE VOCÊ ENTREGA (para cada lead)\n- @ ou nome identificado\n- Classificação: CLIENTE ou LICENCIADO + qual produto\n- Score e temperatura\n- Motivo (qual sinal no texto justifica)\n- Mensagem de DM personalizada, curta, humana, sem parecer spam, que abre conversa (nunca já oferecendo tudo de cara) e convida para o WhatsApp\n\n## ÉTICA\nAborde apenas como abertura de conversa genuína. Nunca gere mensagens enganosas, nunca use dados privados, jamais incentive contato em massa que vire spam. Português brasileiro sempre. Seja prático e organizado, entregando em lista clara.'},
  ];
}

/* TOAST */
function toast(msg,dur=2800){
  let t=document.getElementById('toast');
  if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t);}
  t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),dur);
}

/* UTILS */
function fmtBRL(n){return 'R$ '+Number(n).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});}
function fmtNum(n){return Number(n).toLocaleString('pt-BR');}
function kpiCard(lbl,val,sub,color,icon){
  const sz=String(val).length>10?'1.15rem':String(val).length>7?'1.3rem':'1.45rem';
  return `<div class="kpi" style="border-left:3px solid ${color};">
    <div class="kpi-top"><div class="kpi-lbl">${lbl}</div><div class="kpi-ico">${icon}</div></div>
    <div class="kpi-val" style="font-size:${sz};color:${color};">${val}</div>
    <div class="kpi-sub">${sub}</div>
    <div class="kpi-line" style="background:${color};"></div>
  </div>`;
}
