/* ==========================================================================
   Login - Autenticação e redirecionamento
   ========================================================================== */

// Credenciais mockadas (sistema legado de exemplo)
var USUARIOS_VALIDOS = [
    { usuario: "rodrigo.rosa7", senha: "123456", nome: "Rodrigo",        ra: "220560" },
    { usuario: "vinicius",      senha: "123456", nome: "Vinicius",       ra: "287554" },
    { usuario: "admin",         senha: "admin",  nome: "Administrador",  ra: "000001" }
];

document.addEventListener('DOMContentLoaded', function () {

    var form      = document.getElementById('form-login');
    var inputUser = document.getElementById('login-username');
    var inputPass = document.getElementById('login-password');
    var btnOlho   = document.getElementById('btn-toggle-password');
    var iconOlho  = document.getElementById('eyeIcon');
    var alertBox  = document.getElementById('alert-box');
    var chkLembrar = document.getElementById('login-remember');

    // Se já existe sessão ativa, vai direto para o dashboard
    if (sessionStorage.getItem('unioeste_user')) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Preenche usuário lembrado (se houver)
    var usuarioLembrado = localStorage.getItem('unioeste_remember_user');
    if (usuarioLembrado) {
        inputUser.value = usuarioLembrado;
        chkLembrar.checked = true;
        inputPass.focus();
    } else {
        inputUser.focus();
    }

    // Toggle visibilidade da senha (ícone de olho)
    btnOlho.addEventListener('click', function () {
        if (inputPass.type === 'password') {
            inputPass.type = 'text';
            iconOlho.classList.remove('fa-eye');
            iconOlho.classList.add('fa-eye-slash');
        } else {
            inputPass.type = 'password';
            iconOlho.classList.remove('fa-eye-slash');
            iconOlho.classList.add('fa-eye');
        }
    });

    // Submit do form
    form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        alertBox.innerHTML = '';

        var usuario = inputUser.value.trim();
        var senha   = inputPass.value;

        if (!usuario || !senha) {
            mostrarAlerta('Informe usuário e senha.', 'danger');
            return;
        }

        // Valida credenciais
        var encontrado = null;
        for (var i = 0; i < USUARIOS_VALIDOS.length; i++) {
            if (USUARIOS_VALIDOS[i].usuario === usuario &&
                USUARIOS_VALIDOS[i].senha   === senha) {
                encontrado = USUARIOS_VALIDOS[i];
                break;
            }
        }

        if (!encontrado) {
            mostrarAlerta('Usuário ou senha inválidos.', 'danger');
            inputPass.value = '';
            inputPass.focus();
            return;
        }

        // Grava sessão
        sessionStorage.setItem('unioeste_user', JSON.stringify({
            usuario: encontrado.usuario,
            nome: encontrado.nome,
            ra: encontrado.ra
        }));

        // Lembrar usuário (se marcado)
        if (chkLembrar.checked) {
            localStorage.setItem('unioeste_remember_user', encontrado.usuario);
        } else {
            localStorage.removeItem('unioeste_remember_user');
        }

        // Feedback visual antes de redirecionar
        mostrarAlerta('Autenticado com sucesso. Redirecionando...', 'success');
        setTimeout(function () {
            window.location.href = 'dashboard.html';
        }, 400);
    });

    function mostrarAlerta(msg, tipo) {
        alertBox.innerHTML =
            '<div class="alert alert-' + tipo + ' alert-login-msg">' + msg + '</div>';
    }
});
