/* ==========================================================================
   Assistente Virtual Acadêmico - Chat
   ========================================================================== */

(function () {

    var AULAS = [
        { dia: 'Hoje',   hora: '09:50', disciplina: 'Estruturas de Dados',              docente: 'Leonardo Medeiros',                    data: '24/04/26 09:50-11:30' },
        { dia: 'Seg',    hora: '15:20', disciplina: 'Processo de Eng. de Software I',   docente: 'Victor Francisco Araya Santander',     data: '27/04/26 15:20-17:00' },
        { dia: 'Ter',    hora: '08:00', disciplina: 'Sistemas Administrativos',         docente: 'Claudio Antonio Rojo',                 data: '28/04/26 08:00-11:30' },
        { dia: 'Ter',    hora: '15:20', disciplina: 'Processo de Eng. de Software I',   docente: 'Victor Francisco Araya Santander',     data: '28/04/26 15:20-17:00' },
        { dia: 'Qui',    hora: '08:00', disciplina: 'Estruturas de Dados',              docente: 'Leonardo Medeiros',                    data: '30/04/26 08:00-09:40' }
    ];

    var RESPOSTAS = [
        {
            palavras: ['próxima', 'aula', 'aulas', 'horário', 'horarios', 'horários', 'agenda'],
            responder: function () {
                var linhas = AULAS.map(function (a) {
                    return '• <strong>' + a.dia + ' ' + a.hora + '</strong> — ' + a.disciplina + ' (' + a.docente + ')';
                });
                return 'Suas próximas aulas são:<br><br>' + linhas.join('<br>');
            }
        },
        {
            palavras: ['nota', 'notas', 'média', 'media', 'desempenho'],
            responder: function () {
                return 'Suas notas ainda não foram lançadas no sistema para este período. ' +
                       'Verifique com seu professor ou aguarde o lançamento no Academus.';
            }
        },
        {
            palavras: ['avaliação', 'avaliacao', 'avaliações', 'avaliacoes', 'prova', 'provas', 'trabalho'],
            responder: function () {
                return 'Não há avaliações cadastradas para os próximos dias. ' +
                       'Fique atento ao Academus — seu professor pode cadastrá-las a qualquer momento.';
            }
        },
        {
            palavras: ['matrícula', 'matricula', 'requerimento', 'inscrição', 'inscricao'],
            responder: function () {
                return 'O requerimento de matrícula pode ser feito pelo botão <strong>"Módulo de Requerimento de Matrícula"</strong> ' +
                       'na tela inicial do Academus. O prazo de solicitação é definido pela coordenação do curso.';
            }
        },
        {
            palavras: ['histórico', 'historico', 'disciplinas', 'cursadas', 'aprovado', 'reprovado'],
            responder: function () {
                return 'Seu histórico acadêmico está disponível no menu <strong>Histórico</strong> do Academus. ' +
                       'Lá você encontra todas as disciplinas cursadas, notas finais e situação.';
            }
        },
        {
            palavras: ['contato', 'professor', 'docente', 'email', 'e-mail'],
            responder: function () {
                return 'Os contatos dos docentes estão disponíveis no perfil de cada disciplina dentro do Academus. ' +
                       'Você também pode enviar mensagens pelo próprio sistema.';
            }
        },
        {
            palavras: ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'tudo bem', 'tudo bom'],
            responder: function (user) {
                return 'Olá, ' + (user ? user.nome : 'estudante') + '! Como posso te ajudar?';
            }
        },
        {
            palavras: ['obrigado', 'obrigada', 'valeu', 'thanks', 'grato', 'grata'],
            responder: function () {
                return 'Por nada! Se precisar de mais alguma coisa, é só perguntar.';
            }
        }
    ];

    function respostaPadrao(user) {
        return 'Não encontrei informações específicas sobre isso. Tente perguntar sobre: ' +
               '<strong>notas</strong>, <strong>aulas</strong>, <strong>avaliações</strong>, ' +
               '<strong>matrícula</strong> ou <strong>histórico</strong>.';
    }

    function processar(texto, user) {
        var lower = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        for (var i = 0; i < RESPOSTAS.length; i++) {
            var r = RESPOSTAS[i];
            for (var j = 0; j < r.palavras.length; j++) {
                var palavra = r.palavras[j].normalize('NFD').replace(/[̀-ͯ]/g, '');
                if (lower.indexOf(palavra) !== -1) {
                    return r.responder(user);
                }
            }
        }
        return respostaPadrao(user);
    }

    function adicionarMensagem(texto, tipo) {
        var box = document.getElementById('chat-messages');
        var div = document.createElement('div');
        div.className = 'chat-msg ' + (tipo === 'user' ? 'chat-msg-user' : 'chat-msg-bot');

        if (tipo === 'bot') {
            div.innerHTML =
                '<div class="chat-avatar"><i class="fa fa-graduation-cap"></i></div>' +
                '<div class="chat-bubble">' + texto + '</div>';
        } else {
            div.innerHTML = '<div class="chat-bubble">' + escapeHtml(texto) + '</div>';
        }

        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    }

    function mostrarDigitando() {
        var box = document.getElementById('chat-messages');
        var div = document.createElement('div');
        div.className = 'chat-msg chat-msg-bot chat-digitando';
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
        return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    document.addEventListener('DOMContentLoaded', function () {
        var userRaw = sessionStorage.getItem('unioeste_user');
        var user = userRaw ? JSON.parse(userRaw) : null;

        if (user) {
            var nomeEl = document.getElementById('sidebar-nome');
            var raEl   = document.getElementById('sidebar-ra');
            if (nomeEl) nomeEl.textContent = user.nome;
            if (raEl)   raEl.textContent   = 'RA: ' + user.ra;
        }

        var form  = document.getElementById('chat-form');
        var input = document.getElementById('chat-input');

        function enviar() {
            var texto = input.value.trim();
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

        // Ações rápidas da sidebar
        var botoes = document.querySelectorAll('.btn-acao');
        for (var i = 0; i < botoes.length; i++) {
            botoes[i].addEventListener('click', function () {
                var pergunta = this.getAttribute('data-pergunta');
                input.value = pergunta;
                enviar();
            });
        }

        input.focus();
    });

})();