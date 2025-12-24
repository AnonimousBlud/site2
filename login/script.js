const div = document.getElementById('content');
const form = document.getElementById('loginForm');
const user = document.getElementById('usuario');
const passe = document.getElementById('senha');
const btn = document.getElementById('entrarBtn');

btn.addEventListener('click', async () => {
    const usuario = user.value;
    const senha = passe.value;
    if (!usuario || !senha) {
        const errorP = document.getElementById('errorP');
        errorP.innerHTML = 'Por favor, preencha todos os campos.';
        return;
    }
    try {
        const response = await fetch('https://site2-wqln.onrender.com/api/usuarios/getcode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                usuario: usuario,
                senha: senha
            })
        });

        if (response.status === 200) {
            const data = await response.json();
            const code = data.code;
            window.location.href = `/cadastrar/${code}`;
        }
        if (response.status === 401) {
            const errorP = document.getElementById('errorP');
            errorP.innerHTML = 'Usuário ou senha incorretos.';
        }
        if (response.status === 400) {
            const errorP = document.getElementById('errorP');
            errorP.innerHTML = 'Erro ao fazer login.';
        }
        if (response.status === 502) {
            const errorP = document.getElementById('errorP');
            errorP.innerHTML = 'Erro no servidor.';
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
    }
});