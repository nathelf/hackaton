   Assistente Virtual Acadêmico - Chat com Groq AI + Análise Proativa

(function () {

    // Coloque aqui sua chave do Groq (https://console.groq.com/keys)

    var GROQ_API_KEY = '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';

    var GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
    var GROQ_MODEL    = 'llama-3.3-70b-versatile';

    // PERSONALIZE O COMPORTAMENTO DA IA AQUI
    var SYSTEM_PROMPT =
        'Você é o Uni, assistente virtual acadêmico oficial do sistema Academus da Unioeste ' +
        '(Universidade Estadual do Oeste do Paraná).' +

        '\n\n=== REGRA PRINCIPAL — LEIA COM ATENÇÃO ===\n' +
        'JAMAIS dê respostas curtas, genéricas ou superficiais. Isso é inaceitável. ' +
        'Cada resposta deve ser COMPLETA, DETALHADA e APROFUNDADA. ' +
        'Se o estudante perguntar sobre um conceito de uma disciplina, explique o conceito inteiro, ' +
        'dê exemplos, mostre aplicações práticas, antecipe dificuldades comuns. ' +
        'Se perguntar sobre um processo do Academus, detalhe cada passo, cada prazo, cada condição. ' +
        'Respostas vagas como "consulte seu professor" ou "verifique no sistema" SÃO PROIBIDAS ' +
        'sem antes ter dado toda a informação possível sobre o assunto.' +

        '\n\n=== PERSONALIDADE ===\n' +
        'Você é inteligente, direto e fala como um veterano experiente da universidade. ' +
        'Conhece tudo sobre a Unioeste, o Academus e a vida acadêmica. ' +
        'Trata o estudante pelo nome. Não usa frases de enrolação como "Claro, ficarei feliz em ajudar!" — ' +
        'vai direto ao ponto com conteúdo de valor.' +

        '\n\n=== CONHECIMENTO ===\n' +
        'Domina: todos os processos do Academus, estrutura curricular, pré-requisitos, ' +
        'calendário acadêmico, trancamento, jubilamento, bolsas, PIBIC, estágios, ' +
        'atividades complementares, assistência estudantil, RU, biblioteca, laboratórios. ' +
        'Para conteúdo de disciplinas: explica conceitos com profundidade, dá exemplos de código ' +
        'ou matemáticos quando pertinente, sugere abordagens de estudo específicas.' +

        '\n\n=== ESTRUTURA DAS RESPOSTAS ===\n' +
        'Use sempre: títulos em <strong>negrito</strong>, listas com •, exemplos concretos. ' +
        'Mínimo de 3 parágrafos ou seções por resposta. ' +
        'Termine sempre com uma dica extra ou próximo passo sugerido.';

    // ---------- Dados das aulas ----------

    var AULAS = [
        { dia: 'Seg', hora: '08:00', disciplina: 'Projetos Integrados',                         docente: 'Armando Lopes de Brito Filho e outros', data: '27/04/26 08:00-09:40' },
        { dia: 'Seg', hora: '09:50', disciplina: 'Estruturas Metálicas',                        docente: 'Ricardo Lessa Azevedo',                 data: '27/04/26 09:50-12:20' },
        { dia: 'Ter', hora: '08:00', disciplina: 'Racionalização de Energia e Instrumentação',  docente: 'Samuel Nelson Melegari de Souza',       data: '28/04/26 08:00-08:50' },
        { dia: 'Ter', hora: '09:50', disciplina: 'Administração Rural',                         docente: 'Patrícia Maria Reckziegel da Rocha',    data: '28/04/26 09:50-12:20' },
        { dia: 'Qua', hora: '15:20', disciplina: 'Projetos de Sistemas Energéticos Renováveis', docente: 'Jair Antonio Cruz Siqueira',            data: '29/04/26 15:20-17:00' }
    ];

    // ---------- Histórico Groq ----------

    var historico = [];

    // ---------- Detecção de intenção de quiz ----------

    var PALAVRAS_QUIZ = [
        'quiz', 'questao', 'questoes', 'questão', 'questões',
        'exercicio', 'exercicios', 'exercício', 'exercícios',
        'praticar', 'pratica', 'prática',
        'reforcar', 'reforço', 'reforçar',
        'testar', 'teste', 'me testa',
        'fixar', 'fixação',
        'me pergunta', 'me faz perguntas', 'me faca perguntas',
        'me avalia', 'avaliacao rapida', 'treinar', 'treinamento'
    ];

    function isQuiz(texto) {
        var t = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        for (var i = 0; i < PALAVRAS_QUIZ.length; i++) {
            var p = PALAVRAS_QUIZ[i].normalize('NFD').replace(/[̀-ͯ]/g, '');
            if (t.indexOf(p) !== -1) return true;
        }
        return false;
    }

    function extrairTopico(texto) {
        return texto
            .replace(/me (testa|avalia|faz|faca|pergunta)/gi, '')
            .replace(/(quiz|questoes|questao|exercicio|exercicios|perguntas|treino|treinamento|reforco|reforçar|praticar|fixar)\s*(sobre|de|do|da|dos|das)?\s*/gi, '')
            .replace(/\?/g, '')
            .trim() || texto.trim();
    }

    // ---------- Geração de quiz via Groq ----------

    async function gerarQuiz(topico, callback) {
        var prompt =
            'Gere 4 questões de múltipla escolha sobre: "' + topico + '".\n' +
            'Retorne APENAS um array JSON, sem texto extra, sem markdown, sem ```.\n' +
            'Formato: [{"pergunta":"...","opcoes":["...","...","...","..."],"correta":0,"explicacao":"..."}]\n' +
            '"correta" é o índice 0-3 da resposta correta.\n' +
            'As questões devem ser desafiadoras e educativas para nível universitário.';

        try {
            var res = await fetch(GROQ_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_API_KEY },
                body: JSON.stringify({
                    model: GROQ_MODEL,
                    messages: [
                        { role: 'system', content: 'Você é um gerador de questões acadêmicas. Retorne APENAS JSON válido, sem markdown.' },
                        { role: 'user',   content: prompt }
                    ],
                    temperature: 0.8,
                    max_tokens: 1500
                })
            });
            if (!res.ok) throw new Error('Groq HTTP ' + res.status);
            var data  = await res.json();
            var texto = data.choices[0].message.content.trim()
                .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
            callback(null, JSON.parse(texto));
        } catch (err) {
            callback(err, null);
        }
    }

    // ---------- Renderização do quiz estilo Duolingo ----------

    function renderizarQuiz(perguntas, topico) {
        var qid    = 'quiz-' + Date.now();
        var letras = ['A', 'B', 'C', 'D'];
        var html   =
            '<div class="quiz-wrap" id="' + qid + '">' +
            '<div class="quiz-header">' +
            '<span><i class="fa fa-bolt"></i> <strong>Quiz:</strong> ' + escapeHtml(topico) + '</span>' +
            '<span class="quiz-score" id="' + qid + '-score">0 / ' + perguntas.length + '</span>' +
            '</div>';

        perguntas.forEach(function (q, qi) {
            html +=
                '<div class="quiz-q" id="' + qid + '-q' + qi + '">' +
                '<div class="quiz-pergunta-texto">' + (qi + 1) + '. ' + escapeHtml(q.pergunta) + '</div>' +
                '<div class="quiz-opcoes">';

            q.opcoes.forEach(function (opcao, oi) {
                html +=
                    '<button class="quiz-opcao"' +
                    ' data-quiz="' + qid + '"' +
                    ' data-qi="' + qi + '"' +
                    ' data-oi="' + oi + '"' +
                    ' data-correta="' + q.correta + '"' +
                    ' data-explicacao="' + escapeAttr(q.explicacao) + '">' +
                    '<span class="quiz-letra">' + letras[oi] + '</span>' +
                    escapeHtml(opcao) +
                    '</button>';
            });

            html +=
                '</div>' +
                '<div class="quiz-feedback" id="' + qid + '-f' + qi + '" style="display:none"></div>' +
                '</div>';
        });

        html += '</div>';
        return html;
    }

    function handleQuizAnswer(btn) {
        var qid        = btn.getAttribute('data-quiz');
        var qi         = parseInt(btn.getAttribute('data-qi'));
        var oi         = parseInt(btn.getAttribute('data-oi'));
        var correta    = parseInt(btn.getAttribute('data-correta'));
        var explicacao = btn.getAttribute('data-explicacao');
        var acertou    = oi === correta;

        // Desabilita todas as opções desta questão
        var todas = document.querySelectorAll('[data-quiz="' + qid + '"][data-qi="' + qi + '"]');
        todas.forEach(function (b) { b.disabled = true; });

        btn.classList.add(acertou ? 'quiz-correta' : 'quiz-errada');
        if (!acertou) todas[correta].classList.add('quiz-correta');

        // Feedback com explicação
        var fb = document.getElementById(qid + '-f' + qi);
        if (fb) {
            fb.innerHTML = (acertou ? '✅ ' : '❌ ') + explicacao;
            fb.className = 'quiz-feedback ' + (acertou ? 'quiz-fb-ok' : 'quiz-fb-err');
            fb.style.display = 'block';
        }

        // Atualiza placar
        if (acertou) {
            var scoreEl = document.getElementById(qid + '-score');
            if (scoreEl) {
                var partes = scoreEl.textContent.split('/');
                scoreEl.textContent = (parseInt(partes[0]) + 1) + ' / ' + partes[1].trim();
            }
        }
    }

    // ---------- Google Agenda (ICS download) ----------

    function sincronizarAgenda() {
        var rotina = window.dadosAluno && window.dadosAluno.rotina;
        if (!rotina) return;

        var diasMap = { Seg: 1, Ter: 2, Qua: 3, Qui: 4, Sex: 5, Sab: 6, Dom: 0 };

        function proxData(diaSemana, horaStr) {
            var target = diasMap[diaSemana];
            var now    = new Date();
            var diff   = target - now.getDay();
            if (diff <= 0) diff += 7;
            var d = new Date(now);
            d.setDate(now.getDate() + diff);
            var p = horaStr.split(':');
            d.setHours(parseInt(p[0]), parseInt(p[1]), 0, 0);
            return d;
        }

        function pad(n) { return String(n).padStart(2, '0'); }

        function toIcsDate(d) {
            return d.getFullYear() + pad(d.getMonth()+1) + pad(d.getDate()) +
                   'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00';
        }

        var ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Academus//PT\r\n';

        rotina.blocos.forEach(function (b) {
            var times  = b.hora.split('-');
            var inicio = proxData(b.dia, times[0]);
            var fim    = proxData(b.dia, times[1]);

            ics += 'BEGIN:VEVENT\r\n' +
                   'DTSTART:' + toIcsDate(inicio) + '\r\n' +
                   'DTEND:'   + toIcsDate(fim)    + '\r\n' +
                   'SUMMARY:📚 ' + b.topico        + '\r\n' +
                   'DESCRIPTION:Plano de estudos gerado pelo Assistente Acadêmico Academus\r\n' +
                   'END:VEVENT\r\n';
        });

        ics += 'END:VCALENDAR';

        var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a');
        a.href     = url;
        a.download = 'plano-estudos-academus.ics';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ---------- WhatsApp ----------

    function enviarWhatsapp() {
        var rotina = window.dadosAluno && window.dadosAluno.rotina;
        if (!rotina) return;

        var msg = '📚 *Plano de Estudos — Academus*\n\n' +
                  'Horários agendados para esta semana:\n\n';

        rotina.blocos.forEach(function (b) {
            msg += '📅 *' + b.dia + '  ' + b.hora + '*\n▶ ' + b.topico + '\n\n';
        });

        msg += '_Gerado automaticamente pelo Assistente Acadêmico Academus_ 🎓';

        window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
    }

    // ---------- Plano de estudos ----------

    function respostaHorarios() {
        var rotina = window.dadosAluno && window.dadosAluno.rotina;
        if (!rotina) return 'Não encontrei dados de rotina. Informe seus horários disponíveis para que eu monte um plano personalizado.';
        var linhas = rotina.blocos.map(function (b) {
            return '<tr>' +
                '<td><span class="label label-default">' + b.dia + ' ' + b.hora + '</span></td>' +
                '<td style="padding-left:8px">' + b.topico + '</td>' +
            '</tr>';
        }).join('');
        return '<div class="panel panel-default chat-panel">' +
            '<div class="panel-heading"><strong><i class="fa fa-clock-o"></i> Plano de Estudos Personalizado</strong></div>' +
            '<div class="panel-body">' +
                '<p style="font-size:12px;color:#777;margin-bottom:8px;">' +
                    '<i class="fa fa-briefcase"></i> Sei que você trabalha à <strong>' + rotina.trabalho + '</strong> — ' +
                    'agendei blocos de estudo nos seus horários livres.' +
                '</p>' +
                '<table class="table table-condensed" style="margin-bottom:0;font-size:12px;"><tbody>' +
                    linhas +
                '</tbody></table>' +
            '</div>' +
            '<div class="panel-footer chat-panel-footer">' +
                '<button class="btn btn-sm btn-success btn-acao-plano" data-acao="agenda">' +
                    '<i class="fa fa-calendar-plus-o"></i> Confirmar no Google Agenda' +
                '</button>' +
            '</div>' +
        '</div>';
    }

    function isPlanoEstudos(texto) {
        var t = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        var palavras = ['plano de estudo', 'plano de estudos', 'ver meu plano', 'meu plano', 'rotina de estudo', 'horarios de estudo', 'agenda de estudo'];
        for (var i = 0; i < palavras.length; i++) {
            if (t.indexOf(palavras[i].normalize('NFD').replace(/[̀-ͯ]/g, '')) !== -1) return true;
        }
        return false;
    }

    // ---------- Helpers visuais (Nath) ----------

    function iconStatus(risco) {
        if (risco === 'alto')  return '<i class="fa fa-exclamation-circle text-danger"></i>';
        if (risco === 'medio') return '<i class="fa fa-exclamation-triangle text-warning"></i>';
        return '<i class="fa fa-check-circle text-success"></i>';
    }

    // ---------- Groq: system prompt com dados do aluno ----------

    function buildSystemPrompt(user) {
        var nome = user ? user.nome : 'Estudante';
        var ra   = user ? user.ra   : 'N/A';

        var aulasTexto = AULAS.map(function (a) {
            return '- ' + a.dia + ' ' + a.hora + ': ' + a.disciplina + ' (Prof. ' + a.docente + ')';
        }).join('\n');

        var dadosTexto = '';
        if (window.dadosAluno && window.dadosAluno.disciplinas) {
            dadosTexto = '\nSITUAÇÃO ACADÊMICA ATUAL:\n';
            window.dadosAluno.disciplinas.forEach(function (d) {
                dadosTexto += '- ' + d.nome + ': Nota P1=' + d.nota_p1 +
                    ', Faltas=' + d.faltas + '/' + d.faltas_max +
                    ', Risco=' + d.risco +
                    ', Nota necessária P2=' + d.nota_necessaria_p2 + '\n';
            });
        }

        return (
            SYSTEM_PROMPT + '\n\n' +
            'ESTUDANTE ATUAL:\n' +
            '- Nome: ' + nome + '\n' +
            '- RA: ' + ra + '\n\n' +
            'PRÓXIMAS AULAS DO ESTUDANTE:\n' + aulasTexto +
            dadosTexto + '\n\n' +
            'INSTRUÇÕES DE FORMATO:\n' +
            '- Responda sempre em português do Brasil.\n' +
            '- Use HTML simples: <strong> para negrito, <br> para quebras de linha, bullets (•). Sem Markdown.\n' +
            '- Estruture respostas longas com títulos em negrito e listas para facilitar a leitura.\n' +
            '- Seja completo: prefira uma resposta longa e útil a uma curta e vaga.'
        );
    }

    function markdownParaHtml(texto) {
        return texto
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g,     '<em>$1</em>')
            .replace(/\n/g,            '<br>');
    }

    async function chamarIA(texto, user, callback) {
        historico.push({ role: 'user', content: texto });
        var messages = [{ role: 'system', content: buildSystemPrompt(user) }].concat(historico);

        try {
            var res = await fetch(GROQ_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_API_KEY },
                body: JSON.stringify({ model: GROQ_MODEL, messages: messages, temperature: 0.7, max_tokens: 1500 })
            });

            if (!res.ok) {
                var errData = await res.json();
                throw new Error(errData.error ? errData.error.message : 'Erro HTTP ' + res.status);
            }

            var data     = await res.json();
            var resposta = data.choices[0].message.content;

            historico.push({ role: 'assistant', content: resposta });
            if (historico.length > 20) historico = historico.slice(historico.length - 20);

            callback(null, markdownParaHtml(resposta));
        } catch (err) {
            historico.pop();
            callback(err, null);
        }
    }

    // ---------- Sidebar (Nath) ----------

    function construirSidebar() {
        var ul = document.getElementById('sidebar-disciplinas');
        if (!ul || !window.dadosAluno) return;

        ul.innerHTML = '';
        window.dadosAluno.disciplinas.forEach(function (d) {
            var li = document.createElement('li');
            li.innerHTML = iconStatus(d.risco) + ' ' + d.nome;
            ul.appendChild(li);
        });

        var total   = window.dadosAluno.disciplinas.length;
        var ok      = window.dadosAluno.disciplinas.filter(function (d) { return d.risco === 'baixo'; }).length;
        var atencao = window.dadosAluno.disciplinas.filter(function (d) { return d.risco === 'medio'; }).length;
        var risco   = window.dadosAluno.disciplinas.filter(function (d) { return d.risco === 'alto';  }).length;

        function pct(n) { return Math.round(n / total * 100) + '%'; }

        var bOk = document.getElementById('barra-ok');
        var bAt = document.getElementById('barra-atencao');
        var bRi = document.getElementById('barra-risco');
        if (bOk) bOk.style.width = pct(ok);
        if (bAt) bAt.style.width = pct(atencao);
        if (bRi) bRi.style.width = pct(risco);

        var legend = document.getElementById('sidebar-legend');
        if (legend) {
            legend.innerHTML =
                (ok      ? '<span class="text-success"><i class="fa fa-check-circle"></i> ' + ok      + ' ok</span> '      : '') +
                (atencao ? '<span class="text-warning"><i class="fa fa-exclamation-triangle"></i> ' + atencao + ' atenção</span> ' : '') +
                (risco   ? '<span class="text-danger"><i class="fa fa-exclamation-circle"></i> '   + risco   + ' risco</span>'    : '');
        }
    }

    // ---------- Mensagens proativas (Nath) ----------

    function mensagensProativas() {
        if (!window.dadosAluno) {
            adicionarMensagem(
                'Olá! Sou o Assistente Virtual Acadêmico integrado ao Academus.<br>' +
                'Como posso te ajudar hoje?', 'bot'
            );
            return;
        }

        var emRisco = window.dadosAluno.disciplinas.filter(function (d) { return d.risco === 'alto'; });

        if (emRisco.length === 0) {
            adicionarMensagem(
                'Olá! Analisei sua situação acadêmica — está tudo dentro do esperado. ' +
                'Continue assim! Como posso te ajudar?', 'bot'
            );
            return;
        }

        setTimeout(function () {
            var d = emRisco[0];
            adicionarMensagem(
                '<div class="alert alert-danger chat-alert">' +
                    '&#128680; <strong>Alerta de Risco:</strong> Sua nota da P1 de <strong>' + d.nome + '</strong> ' +
                    'foi atualizada (<strong>' + d.nota_p1 + '</strong>). Combinado com suas ' +
                    '<strong>' + d.faltas + ' faltas</strong>, você entrou na zona de risco de reprovação.' +
                '</div>',
                'bot'
            );

            setTimeout(function () {
                mostrarDigitando();
                setTimeout(function () {
                    removerDigitando();
                    var topicos = (d.topicos_fracos && d.topicos_fracos.length)
                        ? d.topicos_fracos.join(' e ')
                        : 'tópicos prioritários do conteúdo';

                    adicionarMensagem(
                        '<div class="panel panel-default chat-panel">' +
                            '<div class="panel-heading">' +
                                '<strong><i class="fa fa-lightbulb-o"></i> Plano de Recuperação Automático</strong>' +
                            '</div>' +
                            '<div class="panel-body">' +
                                'Eu calculei que você precisa tirar <strong class="text-primary">' + d.nota_necessaria_p2 + '</strong> ' +
                                'na P2 para ser aprovado. Montei um plano de estudos focado em ' +
                                '<strong>' + topicos + '</strong> &mdash; tópicos com menor rendimento na turma.' +
                            '</div>' +
                            '<div class="panel-footer chat-panel-footer">' +
                                '<button class="btn btn-sm btn-default btn-acao-plano" data-acao="agenda">' +
                                    '<i class="fa fa-calendar"></i> Sincronizar com Google Agenda' +
                                '</button>' +
                                '<button class="btn btn-sm btn-default btn-acao-plano" data-acao="whatsapp">' +
                                    '<i class="fa fa-mobile"></i> Lembretes via WhatsApp' +
                                '</button>' +
                                '<button class="btn btn-sm btn-primary btn-acao-plano" data-acao="videoaula">' +
                                    '<i class="fa fa-play-circle"></i> Assistir Videoaula de Revisão' +
                                '</button>' +
                            '</div>' +
                        '</div>',
                        'bot'
                    );


                }, 1000);
            }, 600);
        }, 400);
    }

    // ---------- Layout responsivo (Nath) ----------

    function ajustarLayout() {
        var navbar = document.querySelector('.navbar-fixed-top');
        var wrap   = document.querySelector('.assistente-wrap');
        if (!navbar || !wrap) return;
        var h = navbar.offsetHeight;
        document.body.style.paddingTop = h + 'px';
        wrap.style.height = 'calc(100vh - ' + h + 'px)';
    }

    // ---------- UI helpers ----------

    function adicionarMensagem(html, tipo) {
        var box    = document.getElementById('chat-messages');
        var div    = document.createElement('div');
        var isCard = html.indexOf('panel') !== -1 || html.indexOf('alert') !== -1;
        div.className = 'chat-msg ' + (tipo === 'user' ? 'chat-msg-user' : 'chat-msg-bot') +
                        (isCard ? ' chat-msg-wide' : '');

        if (tipo === 'bot') {
            div.innerHTML =
                '<div class="chat-avatar"><i class="fa fa-graduation-cap"></i></div>' +
                '<div class="chat-bubble' + (isCard ? ' chat-bubble-card' : '') + '">' + html + '</div>';
        } else {
            div.innerHTML = '<div class="chat-bubble">' + escapeHtml(html) + '</div>';
        }

        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    }

    function mostrarDigitando() {
        var box = document.getElementById('chat-messages');
        var div = document.createElement('div');
        div.className = 'chat-msg chat-msg-bot';
        div.id = 'chat-digitando';
        div.innerHTML =
            '<div class="chat-avatar"><i class="fa fa-graduation-cap"></i></div>' +
            '<div class="chat-bubble"><span class="dot-pulse"></span><span class="dot-pulse"></span><span class="dot-pulse"></span></div>';
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    }

    function removerDigitando() {
        var el = document.getElementById('chat-digitando');
        if (el) el.parentNode.removeChild(el);
    }

    function escapeHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function escapeAttr(s) {
        return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ---------- Init ----------

    document.addEventListener('DOMContentLoaded', function () {
        ajustarLayout();
        window.addEventListener('resize', ajustarLayout);

        var userRaw = sessionStorage.getItem('unioeste_user');
        var user    = userRaw ? JSON.parse(userRaw) : null;

        if (user) {
            var nomeEl = document.getElementById('sidebar-nome');
            var raEl   = document.getElementById('sidebar-ra');
            if (nomeEl) nomeEl.textContent = user.nome;
            if (raEl)   raEl.textContent   = 'RA: ' + user.ra;
        }

        construirSidebar();
        mensagensProativas();

        var form    = document.getElementById('chat-form');
        var input   = document.getElementById('chat-input');
        var sendBtn = form.querySelector('button[type="submit"]');

        function setLoading(loading) {
            input.disabled   = loading;
            sendBtn.disabled = loading;
        }

        function enviar(textoForce) {
            var texto = textoForce || input.value.trim();
            if (!texto) return;
            input.value = '';

            adicionarMensagem(texto, 'user');
            mostrarDigitando();
            setLoading(true);

            function done() { removerDigitando(); setLoading(false); input.focus(); }

            if (isPlanoEstudos(texto)) {
                done();
                adicionarMensagem(respostaHorarios(), 'bot');
            } else if (isQuiz(texto)) {
                var topico = extrairTopico(texto);
                gerarQuiz(topico, function (err, perguntas) {
                    done();
                    if (err) {
                        console.error('Quiz error:', err);
                        adicionarMensagem('Não consegui gerar o quiz agora. Tente novamente.', 'bot');
                    } else {
                        adicionarMensagem(renderizarQuiz(perguntas, topico), 'bot');
                    }
                });
            } else {
                chamarIA(texto, user, function (err, resposta) {
                    done();
                    if (err) {
                        console.error('Groq error:', err);
                        adicionarMensagem('Ocorreu um erro ao conectar com o assistente. Verifique sua chave de API e tente novamente.', 'bot');
                    } else {
                        adicionarMensagem(resposta, 'bot');
                    }
                });
            }
        }

        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            enviar();
        });

        // Delegação de eventos para quick replies, botões do plano e quiz
        document.addEventListener('click', function (ev) {
            var t = ev.target.closest ? ev.target.closest('.quiz-opcao') : null;
            if (t && !t.disabled) { handleQuizAnswer(t); return; }

            var el = ev.target;
            if (el.className && el.className.indexOf('quick-reply-btn') !== -1) {
                enviar(el.getAttribute('data-pergunta'));
            }
            if (el.className && el.className.indexOf('btn-acao-plano') !== -1) {
                var acao = el.getAttribute('data-acao');
                if (acao === 'agenda')        sincronizarAgenda();
                else if (acao === 'whatsapp')  enviarWhatsapp();
                else if (acao === 'videoaula') window.open('https://www.youtube.com/watch?v=jJMTY7WSovY', '_blank');
                else alert('Funcionalidade em integração com sistemas externos (demonstração).');
            }
        });

        // Botões de ação rápida da sidebar
        var botoes = document.querySelectorAll('.btn-acao');
        for (var i = 0; i < botoes.length; i++) {
            botoes[i].addEventListener('click', function () {
                enviar(this.getAttribute('data-pergunta'));
            });
        }

        input.focus();
    });

})();
