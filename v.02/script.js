/* STATE & INITIAL CONFIG */
let isStoreOpen = true;
let isAdminAuthenticated = false;
let selectedServiceId = 1;
let selectedTimeSlot = null;
let barberShopWhatsApp = "5575999998888"; // Número oficial da Barbearia
let activeClientPhone = null;

// Catálogo Inicial de Serviços
let services = [
    { id: 1, name: "Apenas Cabelo", price: 35.00, duration: 30, icon: "fa-scissors", isKid: false },
    { id: 2, name: "Cabelo e Barba", price: 60.00, duration: 45, icon: "fa-user-ninja", isKid: false },
    { id: 3, name: "Cabelo + Barba + Sobrancelha", price: 75.00, duration: 60, icon: "fa-crown", isKid: false },
    { id: 4, name: "Apenas Barba", price: 30.00, duration: 30, icon: "fa-user", isKid: false },
    { id: 5, name: "Apenas Sobrancelha", price: 15.00, duration: 15, icon: "fa-eye", isKid: false },
    { id: 6, name: "Corte Cabelo Criança", price: 35.00, duration: 30, icon: "fa-child", isKid: true }
];

function getTodayString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

let appointments = [
    {
        id: 101,
        clientName: "Marcos Silva",
        clientPhone: "(75) 99888-1122",
        serviceId: 1,
        serviceName: "Apenas Cabelo",
        price: 35.00,
        date: getTodayString(),
        time: "09:00",
        status: "Concluído",
        completedDate: getTodayString(),
        isKid: false
    }
];

window.onload = function() {
    document.getElementById('bookingDate').value = getTodayString();
    renderServices();
    renderTimeSlots();
    updateSummaryPrice();
    renderAdminAppointments();
    renderReport();
};

function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById('themeIcon');
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        icon.className = "fa-solid fa-moon text-lg";
    } else {
        html.classList.add('dark');
        icon.className = "fa-solid fa-sun text-lg text-amber-400";
    }
}

function updateStoreStatusBadge() {
    const badge = document.getElementById('badgeStoreStatus');
    const btnAdmin = document.getElementById('btnAdminStoreStatus');
    
    if (isStoreOpen) {
        badge.className = "px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 flex items-center gap-1.5";
        badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>Aberto Agora`;
        btnAdmin.className = "w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition bg-emerald-500 text-slate-950";
        btnAdmin.innerHTML = `<i class="fa-solid fa-door-open"></i><span>Status: ABERTO</span>`;
    } else {
        badge.className = "px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30 flex items-center gap-1.5";
        badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-rose-500"></span>Fechado no Momento`;
        btnAdmin.className = "w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition bg-rose-500 text-white";
        btnAdmin.innerHTML = `<i class="fa-solid fa-door-closed"></i><span>Status: FECHADO</span>`;
    }
}

function toggleStoreStatus() {
    isStoreOpen = !isStoreOpen;
    updateStoreStatusBadge();
    showToast("Status Atualizado", `Barbearia alterada para ${isStoreOpen ? 'ABERTO' : 'FECHADO'}`);
}

function renderServices() {
    const grid = document.getElementById('servicesGrid');
    grid.innerHTML = services.map(s => {
        const isSelected = s.id === selectedServiceId;
        return `
            <div onclick="selectService(${s.id})" class="p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                isSelected ? 'border-amber-500 bg-amber-500/10' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
            }">
                <div class="flex items-start justify-between">
                    <div class="w-10 h-10 rounded-xl ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'} flex items-center justify-center text-lg">
                        <i class="fa-solid ${s.icon}"></i>
                    </div>
                    <span class="text-xs font-extrabold px-2 py-1 rounded-lg ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-700'}">${s.duration} min</span>
                </div>
                <div class="mt-3">
                    <h4 class="font-bold text-sm text-slate-900 dark:text-white">${s.name}</h4>
                    <div class="text-amber-600 dark:text-amber-400 font-extrabold text-base mt-1">R$ ${s.price.toFixed(2).replace('.', ',')}</div>
                </div>
            </div>
        `;
    }).join('');
    renderAdminServices();
}

function selectService(id) {
    selectedServiceId = id;
    renderServices();
    updateSummaryPrice();
    
    const service = services.find(s => s.id === id);
    const kidContainer = document.getElementById('kidFieldsContainer');
    const lblName = document.getElementById('lblClientName');
    const lblPhone = document.getElementById('lblClientPhone');

    if (service && service.isKid) {
        kidContainer.classList.remove('hidden');
        lblName.innerText = "Nome do Responsável pela criança";
        lblPhone.innerText = "Telefone do responsável pela criança";
    } else {
        kidContainer.classList.add('hidden');
        lblName.innerText = "Nome Completo";
        lblPhone.innerText = "Telefone (WhatsApp)";
    }
    renderTimeSlots();
}

function updateSummaryPrice() {
    const service = services.find(s => s.id === selectedServiceId);
    const priceElem = document.getElementById('summaryPrice');
    if (service && priceElem) {
        priceElem.innerText = `R$ ${service.price.toFixed(2).replace('.', ',')}`;
    }
}

function renderTimeSlots() {
    const grid = document.getElementById('timeSlotsGrid');
    const selectedDate = document.getElementById('bookingDate').value;
    const times = [];
    for(let hour = 8; hour <= 18; hour++) {
        const hStr = String(hour).padStart(2, '0');
        times.push(`${hStr}:00`);
        if(hour <= 18) times.push(`${hStr}:30`);
    }

    grid.innerHTML = times.map(t => {
        const isBooked = appointments.some(a => a.date === selectedDate && a.time === t && a.status !== 'Cancelado');
        const isSelected = selectedTimeSlot === t;

        if (isBooked) {
            return `<button disabled class="py-2.5 rounded-xl border border-slate-200 text-xs text-slate-300 line-through cursor-not-allowed bg-slate-100">${t}</button>`;
        }

        return `
            <button onclick="selectTimeSlot('${t}')" class="py-2.5 rounded-xl border text-xs font-bold transition ${
                isSelected ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
            }">${t}</button>
        `;
    }).join('');
}

function selectTimeSlot(timeStr) {
    selectedTimeSlot = timeStr;
    renderTimeSlots();
}

function confirmBooking() {
    if (!isStoreOpen) {
        showToast("Barbearia Fechada", "A barbearia está fechada no momento.", "error");
        return;
    }

    const service = services.find(s => s.id === selectedServiceId);
    const clientName = document.getElementById('inputClientName').value.trim();
    const clientPhone = document.getElementById('inputClientPhone').value.trim();
    const bookingDate = document.getElementById('bookingDate').value;

    if (!clientName || !clientPhone || !selectedTimeSlot) {
        showToast("Preencha os Campos", "Informe seu nome, telefone e selecione o horário.", "error");
        return;
    }

    let newBooking = {
        id: Date.now(),
        clientName: clientName,
        clientPhone: clientPhone,
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        date: bookingDate,
        time: selectedTimeSlot,
        status: "Pendente",
        completedDate: null,
        isKid: service.isKid
    };

    if (service.isKid) {
        const kidName = document.getElementById('inputKidName').value.trim();
        const kidAge = document.getElementById('inputKidAge').value.trim();
        if (!kidName || !kidAge) {
            showToast("Dados da Criança", "Informe o nome e idade da criança.", "error");
            return;
        }
        newBooking.responsibleName = clientName;
        newBooking.kidName = kidName;
        newBooking.kidAge = kidAge;
        newBooking.clientName = `${kidName} (Resp: ${clientName})`;
    }

    appointments.unshift(newBooking);

    const summaryBox = document.getElementById('bookingSuccessSummary');
    summaryBox.innerHTML = `
        <div class="flex justify-between border-b pb-2"><span>Serviço:</span><strong>${service.name}</strong></div>
        <div class="flex justify-between border-b pb-2"><span>Data/Hora:</span><strong class="text-amber-500">${bookingDate} às ${selectedTimeSlot}</strong></div>
        <div class="flex justify-between pt-1 font-bold"><span>Valor:</span><span class="text-emerald-600">R$ ${service.price.toFixed(2).replace('.', ',')}</span></div>
    `;

    let msg = `*Novo Agendamento - BarberStudio*\nCliente: ${clientName}\nTelefone: ${clientPhone}\nServiço: ${service.name}\nData: ${bookingDate} às ${selectedTimeSlot}`;
    document.getElementById('btnSendWhatsApp').href = `https://api.whatsapp.com/send?phone=${barberShopWhatsApp}&text=${encodeURIComponent(msg)}`;

    document.getElementById('modalBookingSuccess').classList.remove('hidden');
    renderTimeSlots();
    renderAdminAppointments();
    renderReport();
}

function closeBookingSuccessModal() {
    document.getElementById('modalBookingSuccess').classList.add('hidden');
}

function openAdminAuthModal() {
    if (isAdminAuthenticated) showAdminPanel();
    else document.getElementById('modalAdminAuth').classList.remove('hidden');
}

function closeAdminAuthModal() {
    document.getElementById('modalAdminAuth').classList.add('hidden');
}

function authenticateAdmin() {
    if (document.getElementById('inputAdminPassword').value === "123456") {
        isAdminAuthenticated = true;
        closeAdminAuthModal();
        showAdminPanel();
    } else {
        document.getElementById('adminAuthError').classList.remove('hidden');
    }
}

function showAdminPanel() {
    document.getElementById('publicView').classList.add('hidden');
    document.getElementById('adminView').classList.remove('hidden');
    renderAdminAppointments();
    renderReport();
}

function logoutAdmin() {
    isAdminAuthenticated = false;
    document.getElementById('adminView').classList.add('hidden');
    document.getElementById('publicView').classList.remove('hidden');
}

function switchAdminTab(tabName) {
    ['agendamentos', 'financeiro', 'servicos'].forEach(t => {
        document.getElementById(`adminTab${t.charAt(0).toUpperCase() + t.slice(1)}`).classList.toggle('hidden', t !== tabName);
    });
}

function renderAdminAppointments() {
    const table = document.getElementById('adminAppointmentsTable');
    const filter = document.getElementById('adminStatusFilter').value;
    const sorted = [...appointments].sort((a, b) => b.id - a.id);
    const filtered = sorted.filter(a => filter === 'todos' || a.status === filter);

    if (filtered.length === 0) {
        table.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">Nenhum agendamento encontrado.</td></tr>`;
        return;
    }

    table.innerHTML = filtered.map(a => `
        <tr class="hover:bg-slate-50/50 transition">
            <td class="py-3 px-4 font-bold">${a.clientName}</td>
            <td class="py-3 px-4">${a.serviceName}</td>
            <td class="py-3 px-4">${a.date} - ${a.time}</td>
            <td class="py-3 px-4 font-bold text-emerald-600">R$ ${a.price.toFixed(2).replace('.', ',')}</td>
            <td class="py-3 px-4">${a.status}</td>
            <td class="py-3 px-4 text-right">
                ${a.status !== 'Cancelado' ? `
                    <button onclick="updateAppointmentStatus(${a.id}, 'Concluído')" class="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">✓</button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

function updateAppointmentStatus(id, newStatus) {
    const app = appointments.find(a => a.id === id);
    if (app) {
        app.status = newStatus;
        if (newStatus === 'Concluído') app.completedDate = getTodayString();
        renderAdminAppointments();
        renderReport();
    }
}

function openMyAppointmentsModal() {
    document.getElementById('modalMyAppointments').classList.remove('hidden');
}

function closeMyAppointmentsModal() {
    document.getElementById('modalMyAppointments').classList.add('hidden');
}

function searchClientAppointments() {
    const rawPhone = document.getElementById('inputClientSearchPhone').value.trim();
    if (!rawPhone) return;
    activeClientPhone = rawPhone.replace(/\D/g, '');
    document.getElementById('clientPhoneLoginForm').classList.add('hidden');
    document.getElementById('clientAppointmentsContainer').classList.remove('hidden');
    renderClientAppointmentsList();
}

function logoutClientSession() {
    activeClientPhone = null;
    document.getElementById('clientPhoneLoginForm').classList.remove('hidden');
    document.getElementById('clientAppointmentsContainer').classList.add('hidden');
}

function renderClientAppointmentsList() {
    const listContainer = document.getElementById('clientAppointmentsList');
    const clientApps = appointments.filter(a => a.clientPhone.replace(/\D/g, '') === activeClientPhone);
    listContainer.innerHTML = clientApps.map(a => `
        <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex justify-between items-center">
            <div><strong>${a.serviceName}</strong><p class="text-xs text-slate-400">${a.date} às ${a.time}</p></div>
            <span class="text-xs font-bold">${a.status}</span>
        </div>
    `).join('');
}

function showToast(title, message, type = 'info') {
    const toast = document.getElementById('toast');
    document.getElementById('toastTitle').innerText = title;
    document.getElementById('toastMessage').innerText = message;
    toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
    setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none'), 3500);
}