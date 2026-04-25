/* ==========================================================================
   Assistente Virtual Acadêmico - Chat com análise proativa
   ========================================================================== */

(function () {

    // ---------- Helpers visuais ----------

    function iconStatus(risco) {
        if (risco === 'alto')  return '<i class="fa fa-exclamation-circle text-danger"></i>';
        if (risco === 'medio') return '<i class="fa fa-exclamation-triangle text-warning"></i>';
        return '<i class="fa fa-check-circle text-success"></i>';
    }

    function stripAcentos(s) {
        return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    }

    // ---------- Respostas baseadas nos dados mockados ----------

    function respostaFaltas() {
        if (!window.dadosAluno) return 'Não consegui acessar os dados de faltas.';
        var linhas = window.dadosAluno.disciplinas.map(function (d) {
            var restam = d.faltas_max - d.faltas;
            var cor = restam <= 2 ? 'text-danger' : restam <= 5 ? 'text-warning' : 'text-success';
            return '&bull; <strong>' + d.nome + '</strong>: <span class="' + cor + '"><strong>' + restam +
                   '</strong> falta(s) restante(s)</span> <small class="text-muted">(' + d.faltas + '/' + d.faltas_max + ' usadas)</small>';
        });
        return 'Situação das suas faltas:<br><br>' + linhas.join('<br>');
    }

    function respostaSituacao() {
        if (!window.dadosAluno) return 'Não consegui acessar os dados do sistema.';
        var linhas = window.dadosAluno.disciplinas.map(function (d) {
            var badge = d.risco === 'alto' ? '<span class="label label-danger">Risco</span>'
                      : d.risco === 'medio' ? '<span class="label label-warning">Atenção</span>'
                      : '<span class="label label-success">OK</span>';
            return '&bull; <strong>' + d.nome + '</strong>: Nota P1 <strong>' + d.nota_p1 +
                   '</strong> &nbsp;|&nbsp; Faltas: ' + d.faltas + ' &nbsp;' + badge;
        });
        return 'Sua situação atual no semestre:<br><br>' + linhas.join('<br>');
    }

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
                '<button class="btn btn-sm btn-success btn-acao-plano">' +
                    '<i class="fa fa-calendar-plus-o"></i> Confirmar no Google Agenda' +
                '</button>' +
            '</div>' +
        '</div>';
    }

    function respostaSimular() {
        if (!window.dadosAluno) return 'Não consegui acessar os dados do sistema.';
        var linhas = window.dadosAluno.disciplinas.map(function (d) {
            var cor = d.risco === 'alto' ? 'text-danger' : d.risco === 'medio' ? 'text-warning' : 'text-success';
            return '&bull; <strong>' + d.nome + '</strong>: precisa de ' +
                   '<span class="' + cor + '"><strong>' + d.nota_necessaria_p2 + '</strong></span> na P2.';
        });
        return 'Simulação para aprovação (média &ge; 6,0):<br><br>' + linhas.join('<br>') +
               '<br><br><small class="text-muted">* Cálculo: (Nota P1 + Nota P2) / 2 &ge; 6,0</small>';
    }

    // ---------- Tabela de respostas ----------

    var AULAS = [
        { dia: 'Seg', hora: '08:00', disciplina: 'Projetos Integrados',                        docente: 'Armando Lopes de Brito Filho e outros', data: '27/04/26 08:00-09:40' },
        { dia: 'Seg', hora: '09:50', disciplina: 'Estruturas Metálicas',                       docente: 'Ricardo Lessa Azevedo',                 data: '27/04/26 09:50-12:20' },
        { dia: 'Ter', hora: '08:00', disciplina: 'Racionalização de Energia e Instrumentação', docente: 'Samuel Nelson Melegari de Souza',       data: '28/04/26 08:00-08:50' },
        { dia: 'Ter', hora: '09:50', disciplina: 'Administração Rural',                        docente: 'Patrícia Maria Reckziegel da Rocha',    data: '28/04/26 09:50-12:20' },
        { dia: 'Qua', hora: '15:20', disciplina: 'Projetos de Sistemas Energéticos Renováveis',docente: 'Jair Antonio Cruz Siqueira',            data: '29/04/26 15:20-17:00' }
    ];

    var RESPOSTAS = [
        {
            palavras: ['horario', 'horários', 'estudo', 'estudar', 'plano de estudo', 'rotina', 'trabalho', 'agenda'],
            responder: respostaHorarios
        },
        {
            palavras: ['falta', 'faltas', 'quantas'],
            responder: respostaFaltas
        },
        {
            palavras: ['situacao', 'situação', 'atual', 'panorama'],
            responder: respostaSituacao
        },
        {
            palavras: ['simular', 'simulacao', 'simulação', 'nota final', 'media final', 'média final'],
            responder: respostaSimular
        },
        {
            palavras: ['proxima', 'aula', 'aulas', 'horario', 'horarios', 'agenda'],
            responder: function () {
                var linhas = AULAS.map(function (a) {
                    return '&bull; <strong>' + a.dia + ' ' + a.hora + '</strong> &mdash; ' + a.disciplina + ' (' + a.docente + ')';
                });
                return 'Suas próximas aulas são:<br><br>' + linhas.join('<br>');
            }
        },
        {
            palavras: ['nota', 'notas', 'media', 'média', 'desempenho'],
            responder: function () {
                return window.dadosAluno ? respostaSituacao() :
                    'Suas notas ainda não foram lançadas. Verifique com seu professor ou aguarde no Academus.';
            }
        },
        {
            palavras: ['avaliacao', 'avaliação', 'prova', 'provas', 'trabalho'],
            responder: function () {
                return 'Não há avaliações cadastradas para os próximos dias. ' +
                       'Fique atento ao Academus — seu professor pode cadastrá-las a qualquer momento.';
            }
        },
        {
            palavras: ['matricula', 'matrícula', 'requerimento', 'inscricao', 'inscrição'],
            responder: function () {
                return 'O requerimento de matrícula pode ser feito pelo botão ' +
                       '<strong>"Módulo de Requerimento de Matrícula"</strong> na tela inicial do Academus.';
            }
        },
        {
            palavras: ['historico', 'histórico', 'cursadas', 'aprovado', 'reprovado'],
            responder: function () {
                return 'Seu histórico acadêmico está disponível no menu <strong>Histórico</strong> do Academus. ' +
                       'Lá você encontra todas as disciplinas cursadas, notas finais e situação.';
            }
        },
        {
            palavras: ['oi', 'ola', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'tudo bem'],
            responder: function (user) {
                return 'Olá, ' + (user ? user.nome : 'estudante') + '! Como posso te ajudar?';
            }
        },
        {
            palavras: ['obrigado', 'obrigada', 'valeu', 'grato', 'grata'],
            responder: function () { return 'Por nada! Se precisar de mais alguma coisa, é só perguntar.'; }
        }
    ];

    function respostaPadrao() {
        return 'Não encontrei informações sobre isso. Tente perguntar sobre: ' +
               '<strong>faltas</strong>, <strong>situação atual</strong>, <strong>simular nota</strong>, ' +
               '<strong>aulas</strong> ou <strong>matrícula</strong>.';
    }

    function processar(texto, user) {
        var lower = stripAcentos(texto);
        for (var i = 0; i < RESPOSTAS.length; i++) {
            var r = RESPOSTAS[i];
            for (var j = 0; j < r.palavras.length; j++) {
                if (lower.indexOf(stripAcentos(r.palavras[j])) !== -1) {
                    return r.responder(user);
                }
            }
        }
        return respostaPadrao();
    }

    // ---------- Renderização de mensagens ----------

    function adicionarMensagem(html, tipo) {
        var box = document.getElementById('chat-messages');
        var div = document.createElement('div');
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
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ---------- Sidebar ----------

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

    // ---------- Mensagens proativas ----------

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

        // Mensagem 1: alerta de risco
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

            // Mensagem 2: plano de recuperação
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
                                '<button class="btn btn-sm btn-default btn-acao-plano">' +
                                    '<i class="fa fa-calendar"></i> Sincronizar com Google Agenda' +
                                '</button>' +
                                '<button class="btn btn-sm btn-default btn-acao-plano">' +
                                    '<i class="fa fa-mobile"></i> Lembretes via WhatsApp' +
                                '</button>' +
                                '<button class="btn btn-sm btn-primary btn-acao-plano">' +
                                    '<i class="fa fa-play-circle"></i> Assistir Videoaula de Revisão' +
                                '</button>' +
                            '</div>' +
                        '</div>',
                        'bot'
                    );

                    // Mensagem 3: plano de horários respeitando a rotina de trabalho
                    if (window.dadosAluno && window.dadosAluno.rotina) {
                        setTimeout(function () {
                            mostrarDigitando();
                            setTimeout(function () {
                                removerDigitando();
                                adicionarMensagem(respostaHorarios(), 'bot');
                            }, 900);
                        }, 900);
                    }
                }, 1000);
            }, 600);
        }, 400);
    }

    // ---------- Layout ----------

    function ajustarLayout() {
        var navbar = document.querySelector('.navbar-fixed-top');
        var wrap   = document.querySelector('.assistente-wrap');
        if (!navbar || !wrap) return;
        var h = navbar.offsetHeight;
        document.body.style.paddingTop = h + 'px';
        wrap.style.height = 'calc(100vh - ' + h + 'px)';
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

        var form  = document.getElementById('chat-form');
        var input = document.getElementById('chat-input');

        function enviar(textoForce) {
            var texto = textoForce || input.value.trim();
            if (!texto) return;
            input.value = '';

            adicionarMensagem(texto, 'user');
            mostrarDigitando();

            setTimeout(function () {
                removerDigitando();
                adicionarMensagem(processar(texto, user), 'bot');
            }, 700);
        }

        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            enviar();
        });

        // Delegação de eventos para quick replies e botões do plano
        document.addEventListener('click', function (ev) {
            var t = ev.target;
            if (t.className && t.className.indexOf('quick-reply-btn') !== -1) {
                enviar(t.getAttribute('data-pergunta'));
            }
            if (t.className && t.className.indexOf('btn-acao-plano') !== -1) {
                alert('Funcionalidade em integração com sistemas externos (demonstração).');
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