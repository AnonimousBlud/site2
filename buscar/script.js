const API = 'https://contempo-30ng.onrender.com';
const placasBody = document.getElementById('placasBody');
const searchInput = document.getElementById('search');

const path = window.location.pathname;
const part = path.split('?');
const code = part[1];

if (!code) {
    window.location.href = '/login/';
}

document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch(`https://site2-wqln.onrender.com/api/validate/${code}`);
    if (!response.ok) {
        window.location.href = '/login/';
    }
})

let placas = [];
let bootstrapModal;
document.addEventListener('DOMContentLoaded', () => {
    fetchAll();

    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && (e.key === 'b' || e.key === 'B')) {
            e.preventDefault();
            searchInput.focus();
        }
    });

    searchInput.addEventListener('input', renderTable);

    const modalEl = document.getElementById('editModal');
    bootstrapModal = new bootstrap.Modal(modalEl);

    const editValor = document.getElementById('editValor');
    editValor.addEventListener('input', () => {
        let digits = (editValor.value || '').replace(/\D/g, '');
        if (!digits) { editValor.value = ''; editValor.dataset.digits = ''; return; }
        editValor.dataset.digits = digits;
        const cents = parseInt(digits, 10) / 100;
        editValor.value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents);
    });

    document.getElementById('saveEditBtn').addEventListener('click', async () => {
        const placa = document.getElementById('editPlaca').value;
        const cliente = document.getElementById('editCliente').value.trim();
        const valor = document.getElementById('editValor').value.trim();
        const status = document.getElementById('editStatus').value;

        try {
            const res = await fetch(`${API}/placas/${encodeURIComponent(placa)}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ cliente, valor, status })
            });
            if (!res.ok) throw new Error('Erro ao atualizar');
            const updated = await res.json();
            const idx = placas.findIndex(p => p.placa === updated.placa);
            if (idx !== -1) placas[idx] = updated;
            renderTable();
            bootstrapModal.hide();
            alert('Atualizado com sucesso');
        } catch (err) {
            console.error(err);
            alert('Erro ao atualizar placa');
        }
    });
});

async function fetchAll() {
    try {
        const res = await fetch(`${API}/placas`);
        placas = await res.json();
        renderTable();
    } catch (err) {
        console.error('Erro ao buscar placas', err);
        placas = [];
        renderTable();
    }
}

function getStatusStyle(status) {
    const s = (status || '').toString().trim().toLowerCase();
    if (s === 'entregue' || s === 'enviado') return 'background:#FFFF00;';
    if (s === 'cobrado') return 'background: #ff2bcaff;';
    if (s === 'solicitado') return 'background: #6B7280;';
    if (s === 'pago') return 'background: #2563EB;';
    if (s === 'cadastrada') return 'background: #16A34A;';
    return '';
}

function renderTable() {
    const q = (searchInput.value || '').trim().toLowerCase();
    const filtered = q ? placas.filter(p => (p.placa || '').toLowerCase().includes(q)) : placas;
    placasBody.innerHTML = '';
    for (const p of filtered) {
        const statusStyle = getStatusStyle(p.status);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="align-middle">${escapeHtml(p.placa)}</td>
            <td class="align-middle">${escapeHtml(p.cliente)}</td>
            <td class="align-middle">${escapeHtml(p.valor || '')}</td>
            <td class="align-middle" style="${statusStyle}">${escapeHtml(p.status)}</td>
            <td class="align-middle position-relative">
                <button class="dots-btn border pt-2 px-2 rounded-lg pr-3" aria-label="ações">
                    <span class="material-icons">more_vert</span>
                </button>
                <div class="action-menu d-none" role="menu">
                    <button class="btn btn-sm font-normal px-3 edit-btn">Editar</button>
                    <button class="btn btn-sm text-danger delete-btn">Apagar</button>
                </div>
            </td>
        `;
        const btn = tr.querySelector('.dots-btn');
        const menu = tr.querySelector('.action-menu');

        btn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            document.querySelectorAll('.action-menu').forEach(m => {
                if (m !== menu) m.classList.add('d-none');
            });
            menu.classList.toggle('d-none');
        });

        tr.querySelector('.edit-btn').addEventListener('click', () => openEditModal(p));
        tr.querySelector('.delete-btn').addEventListener('click', (ev) => {
            ev.stopPropagation();
            deletePlaca(p.placa);
        });

        document.addEventListener('click', () => menu.classList.add('d-none'), { once: true });
        placasBody.appendChild(tr);
    }
}

async function deletePlaca(placa) {
    if (!confirm(`Confirma apagar a placa ${placa}? Esta ação não pode ser desfeita.`)) return;
    try {
        const res = await fetch(`${API}/placas/${encodeURIComponent(placa)}`, { method: 'DELETE' });
        if (res.status === 204) {
            placas = placas.filter(p => p.placa !== placa);
            renderTable();
            alert('Placa apagada');
        } else {
            const body = await res.json().catch(()=>null);
            alert(`Erro ao apagar: ${body && body.error ? body.error : res.statusText}`);
        }
    } catch (err) {
        console.error('Erro ao apagar placa:', err);
        alert('Erro ao apagar placa. Veja o console.');
    }
}

function openEditModal(p) {
    document.getElementById('editPlaca').value = p.placa;
    document.getElementById('editCliente').value = p.cliente || '';
    document.getElementById('editValor').value = p.valor || '';
    document.getElementById('editStatus').value = p.status || 'Cadastrada';
    bootstrapModal.show();
}

function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
setInterval(() => {
    fetchAll();
    console.log('Atualizado lista de placas automaticamente');
}, 5 * 60 * 1000);