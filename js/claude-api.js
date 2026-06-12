/* GREENFLOW PLATFORM - claude-api.js - Integracao com modelos Claude (Anthropic) */

const CLAUDE_MODELS = {
  haiku:  { id:'claude-3-5-haiku-20241022', label:'Claude Haiku',  costIn:0.0008, costOut:0.004,  desc:'Conversas leves · alto volume' },
  sonnet: { id:'claude-sonnet-4-20250514',  label:'Claude Sonnet', costIn:0.003,  costOut:0.015,  desc:'Qualificação premium · análise' },
};

/* Roteamento inteligente: decide o modelo pelo tipo de tarefa */
function chooseModel(taskType){
  // tarefas leves -> haiku (70% dos casos) | analise/qualificacao -> sonnet
  return ['qualify','analysis','report'].includes(taskType) ? 'sonnet' : 'haiku';
}

/* Chamada principal a API Anthropic */
async function callClaude({ model='haiku', system='', messages=[], maxTokens=1000 }){
  const m = CLAUDE_MODELS[model] || CLAUDE_MODELS.haiku;
  const t0 = performance.now();
  // Em produção (Vercel) usa o proxy seguro /api/claude; localmente cai no endpoint direto
  const endpoint = location.protocol.startsWith('http') && !location.host.includes('localhost')
    ? '/api/claude' : 'https://api.anthropic.com/v1/messages';
  try{
    const r = await fetch(endpoint, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ model:m.id, max_tokens:maxTokens, system, messages })
    });
    const d = await r.json();
    const ms = Math.round(performance.now()-t0);
    const text = (d.content||[]).map(b=>b.type==='text'?b.text:'').join('');
    const usage = d.usage || { input_tokens: 400, output_tokens: 200 };
    const cost = (usage.input_tokens/1000)*m.costIn + (usage.output_tokens/1000)*m.costOut;
    logRequest({ model, label:m.label, ok:!!text, ms, tokensIn:usage.input_tokens, tokensOut:usage.output_tokens, cost });
    return { ok:!!text, text: text || 'Sem resposta', ms, cost };
  }catch(e){
    logRequest({ model, label:m.label, ok:false, ms:0, tokensIn:0, tokensOut:0, cost:0 });
    return { ok:false, text:'Erro de conexão com a API', ms:0, cost:0 };
  }
}

/* Log de requisicoes - alimenta dashboard e auditoria */
function logRequest({model,label,ok,ms,tokensIn,tokensOut,cost}){
  const logs = GF.store.g('logs',[]);
  logs.unshift({
    id: 1580 + logs.length + 1,
    ts: new Date().toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}),
    fn: model==='sonnet' ? 'Qualificação premium' : 'Agente Energy · conversa',
    model, label, ok, ms, tokensIn, tokensOut, cost
  });
  GF.store.s('logs', logs.slice(0,200));
}

/* Salva conversa no historico */
function saveConversation(agentName, messages){
  const hist = GF.store.g('history',[]);
  hist.unshift({
    id: Date.now(),
    agent: agentName,
    ts: new Date().toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}),
    count: messages.length,
    messages
  });
  GF.store.s('history', hist.slice(0,100));
}

/* Estatisticas agregadas para o dashboard */
function gfStats(){
  const logs = GF.store.g('logs',[]);
  const totalCost = logs.reduce((s,l)=>s+(l.cost||0),0);
  const tokens = logs.reduce((s,l)=>s+(l.tokensIn||0)+(l.tokensOut||0),0);
  const okCount = logs.filter(l=>l.ok).length;
  const haiku = logs.filter(l=>l.model==='haiku').length;
  const sonnet = logs.filter(l=>l.model==='sonnet').length;
  const avgMs = logs.length ? Math.round(logs.reduce((s,l)=>s+(l.ms||0),0)/logs.length) : 0;
  return { logs, totalCost, tokens, okCount, haiku, sonnet, avgMs,
    haikuPct: logs.length ? Math.round(haiku/(haiku+sonnet||1)*100) : 70 };
}
