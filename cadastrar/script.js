const API = 'https://contempo-30ng.onrender.com';
const div = document.getElementById('content');
const form = document.getElementById('cadastrarForm');
const placa = document.getElementById('placa');
const cadastrar = document.getElementById('cadastrarBtn');

const cadastro = document.getElementById('cadastro-link');
const buscar = document.getElementById('buscar-link');

const params = new URLSearchParams(window.location.search);

const code = params.get('code');

cadastro.href = window.location.href;
buscar.href = `/buscar/index.html?code=${code}`;

const response = await fetch(`https://site2-wqln.onrender.com/api/validate/${code}`);
const data = await response.json();
const user = data.body.user;

document.addEventListener('DOMContentLoaded', async () => {
    const code = params.get('code');
    if (!code) {
        window.location.href = '/login/';
    }
    if (code === '12345678') {
        window.location.href = '/login/';
    }
    if (code.length !== 8) {
        window.location.href = '/login/';
    }

    const response = await fetch(`https://site2-wqln.onrender.com/api/validate/${code}`);
    const data = await response.json();
    const user = data.body.user;

    if (!response.ok) {
        window.location.href = '/login/';
    }

    const activeUser = document.getElementById('active-user');

    activeUser.innerHTML = `${user} - SODESP/RS`;
    
    document.title = `${user} - Buscar`;
});

const time = document.getElementById('time');
let value = 30;
time.innerHTML = `Sua sessão expira em ${value} minutos`;

setInterval(() => {
    value--;
}, 60000);

function isValidPlaca(p) {
    if (!p) return false;
    const v = p.toUpperCase().trim();
    const mercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
    const antigo = /^[A-Z]{3}[0-9]{4}$/;
    return mercosul.test(v) || antigo.test(v);
}

function formatBRLInput(el) {
    let digits = (el.dataset.digits || '') + '';
    digits = (el.value || '').replace(/\D/g, '');
    if (digits === '') {
        el.dataset.digits = '';
        el.value = '';
        return;
    }
    el.dataset.digits = digits;
    const num = parseInt(digits, 10);
    const cents = num / 100;
    el.value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents);
}

function sanitizePlacaInput(el) {
    if (!el) return;
    const raw = (el.value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    let out = '';
    let mode = null;
    for (const ch of raw) {
        const pos = out.length;
        if (pos < 3) {
            if (/[A-Z]/.test(ch)) out += ch;
            else continue;
        } else if (pos === 3) {
            if (/\d/.test(ch)) out += ch;
            else continue;
        } else if (pos === 4) {
            if (/[A-Z]/.test(ch)) { out += ch; mode = 'mercosul'; }
            else if (/\d/.test(ch)) { out += ch; mode = 'antigo'; }
            else continue;
        } else if (pos >= 5) {
            if (/\d/.test(ch)) out += ch;
            else continue;
        }
        if (out.length >= 7) break;
    }
    el.value = out;
}

placa.addEventListener('input', (e) => {
    const prev = placa.value;
    sanitizePlacaInput(placa);
});

valor.addEventListener('input', (e) => {
    const selStart = valor.selectionStart;
    formatBRLInput(valor);
});

cadastrar.addEventListener('click', async (e) => {
    e.preventDefault();
    const placaValue = placa.value.trim().toUpperCase();
    
    const digits = (valor.dataset.digits || '').replace(/\D/g, '');
    if ((!valorValue || valorValue === '') && digits) {
        valorValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
            .format(parseInt(digits, 10) / 100);
    }

    if (!placaValue) {
        const missing = [];
        if (!placaValue) missing.push('placa');
        alert('Por favor, preencha todos os campos. Faltando: ' + missing.join(', '));
        return;
    }

    try {
        const payload = {
            placa: placaValue
        };

        const response = await fetch(`${API}/placas/clientes/${user}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            const data = await response.json();
            alert(`Placa cadastrada com sucesso! ID: ${data.id}`);
            form.reset();
            valor.dataset.digits = '';
        } else if (response.status === 409) {
            alert('Erro: Placa já existe.');
        } else if (response.status === 400) {
            const body = await response.json().catch(()=>null);
            alert(`Erro: ${body && body.error ? body.error : 'Dados inválidos'}`);
        } else {
            alert('Erro ao cadastrar placa.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor.');
    }
});
