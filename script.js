/* JavaScript extraído do projeto BarberStudio / BM Soft.
   Observação: o projeto utiliza Tailwind CSS via CDN.
*/

tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        brand: {
                            50: '#fffbeb',
                            100: '#fef3c7',
                            500: '#f59e0b',
                            600: '#d97706',
                            700: '#b45309',
                            dark: '#0f172a',
                            card: '#1e293b'
                        }
                    }
                }
            }
        }

/* ESTADO E CONFIGURAÇÃO INICIAL */
        let isStoreOpen = true;
        let isAdminAuthenticated = false;
        let selectedServiceId = 1;
        let selectedTimeSlot = null;
        let barberShopWhatsApp = "5575999998888"; // Número do WhatsApp da Barbearia
        let activeClientPhone = null;

        // Lista de Serviços Iniciais
        let services = [
            { id: 1, name: "Apenas Cabelo", price: 35.00, duration: 30, icon: "fa-scissors", isKid: false },
            { id: 2, name: "Cabelo e Barba", price: 60.00, duration: 45, icon: "fa-user-ninja", isKid: false },
            { id: 3, name: "Cabelo + Barba + Sobrancelha", price: 75.00, duration: 60, icon: "fa-crown", isKid: false },
            { id: 4, name: "Apenas Barba", price: 30.00, duration: 30, icon: "fa-user", isKid: false },
            { id: 5, name: "Apenas Sobrancelha", price: 15.00, duration: 15, icon: "fa-eye", isKid: false },
            { id: 6, name: "Corte Cabelo Criança", price: 35.00, duration: 30, icon: "fa-child", isKid: true }
        ];

        // Função auxiliar para formatar a sequência de datas no formato YYYY-MM-DD
        function getTodayString() {
            const d = new Date();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        // Consultas Simuladas Iniciais
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
            },
            {
                id: 102,
                clientName: "João Pedro (Resp: Carlos)",
                clientPhone: "(75) 98765-4321",
                serviceId: 6,
                serviceName: "Corte Cabelo Criança",
                price: 35.00,
                date: getTodayString(),
                time: "10:30",
                status: "Pendente",
                completedDate: null,
                isKid: true,
                responsibleName: "Carlos Oliveira",
                kidName: "João Pedro",
                kidAge: 6
            }
        ];

        /* INICIALIZAÇÃO */
        window.onload = function() {
            document.getElementById('bookingDate').value = getTodayString();
            renderServices();
            renderTimeSlots();
            updateSummaryPrice();
            renderAdminAppointments();
            renderReport();
        };

        /* TEMA LIGHT / DARK */
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

        /* Indicador de STATUS DA LOJA */
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

        /* PRESTAÇÃO E SELEÇÃO DE SERVIÇOS */
        function renderServices() {
            const grid = document.getElementById('servicesGrid');
            grid.innerHTML = services.map(s => {
                const isSelected = s.id === selectedServiceId;
                return `
                    <div onclick="selectService(${s.id})" class="p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                        isSelected 
                        ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/10' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                    }">
                        <div class="flex items-start justify-between">
                            <div class="w-10 h-10 rounded-xl ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'} flex items-center justify-center text-lg">
                                <i class="fa-solid ${s.icon}"></i>
                            </div>
                            <span class="text-xs font-extrabold px-2 py-1 rounded-lg ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}">
                                ${s.duration} min
                            </span>
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

        /* GERAÇÃO DE INTERVALOS DE TEMPO DE 30 MINUTOS */
        function renderTimeSlots() {
            const grid = document.getElementById('timeSlotsGrid');
            const selectedDate = document.getElementById('bookingDate').value;
            const service = services.find(s => s.id === selectedServiceId);
            
            // Horários disponíveis das 08:00 às 18:30 (em incrementos de 30 minutos)
            const times = [];
            for(let hour = 8; hour <= 18; hour++) {
                const hStr = String(hour).padStart(2, '0');
                times.push(`${hStr}:00`);
                if(hour < 18 || (hour === 18)) {
                    times.push(`${hStr}:30`);
                }
            }

            grid.innerHTML = times.map(t => {
                // Verifique se já está reservado.
                const isBooked = appointments.some(a => a.date === selectedDate && a.time === t && a.status !== 'Cancelado');
                const isSelected = selectedTimeSlot === t;

                if (isBooked) {
                    return `
                        <button disabled class="py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-300 dark:text-slate-600 line-through cursor-not-allowed bg-slate-100 dark:bg-slate-900">
                            ${t}
                        </button>
                    `;
                }

                return `
                    <button onclick="selectTimeSlot('${t}')" class="py-2.5 rounded-xl border text-xs font-bold transition ${
                        isSelected 
                        ? 'border-amber-500 bg-amber-500 text-slate-950 shadow-md' 
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-amber-500'
                    }">
                        ${t}
                    </button>
                `;
            }).join('');
        }

        function selectTimeSlot(timeStr) {
            selectedTimeSlot = timeStr;
            renderTimeSlots();
        }

        /* CONFIRMAÇÃO DE RESERVA E REDIRECIONAMENTO VIA WHATSAPP */
        function confirmBooking() {
            if (!isStoreOpen) {
                showToast("Barbearia Fechada", "A barbearia está fechada no momento para novos agendamentos.", "error");
                return;
            }

            const service = services.find(s => s.id === selectedServiceId);
            const clientName = document.getElementById('inputClientName').value.trim();
            const clientPhone = document.getElementById('inputClientPhone').value.trim();
            const bookingDate = document.getElementById('bookingDate').value;

            if (!clientName || !clientPhone) {
                showToast("Dados Incompletos", "Por favor, preencha nome e telefone.", "error");
                return;
            }

            if (!selectedTimeSlot) {
                showToast("Selecione o Horário", "Por favor, escolha um horário disponível.", "error");
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

            // Adiciona o novo agendamento no início da lista
            appointments.unshift(newBooking);

            // Criar HTML de resumo para o modal
            const summaryBox = document.getElementById('bookingSuccessSummary');
            summaryBox.innerHTML = `
                <div class="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span class="text-slate-400">Serviço:</span>
                    <span class="font-bold text-slate-900 dark:text-white">${service.name}</span>
                </div>
                ${service.isKid ? `
                    <div class="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                        <span class="text-slate-400">Responsável:</span>
                        <span class="font-bold text-slate-900 dark:text-white">${newBooking.responsibleName}</span>
                    </div>
                    <div class="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                        <span class="text-slate-400">Criança / Idade:</span>
                        <span class="font-bold text-purple-600 dark:text-purple-400">${newBooking.kidName} (${newBooking.kidAge} anos)</span>
                    </div>
                ` : `
                    <div class="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                        <span class="text-slate-400">Cliente:</span>
                        <span class="font-bold text-slate-900 dark:text-white">${clientName}</span>
                    </div>
                `}
                <div class="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span class="text-slate-400">Data e Hora:</span>
                    <span class="font-bold text-amber-500">${bookingDate} às ${selectedTimeSlot}</span>
                </div>
                <div class="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span class="text-slate-400">Telefone Contato:</span>
                    <span class="font-bold text-slate-900 dark:text-white">${clientPhone}</span>
                </div>
                <div class="flex justify-between pt-1 font-bold text-sm">
                    <span class="text-slate-500">Valor Total:</span>
                    <span class="text-emerald-600 dark:text-emerald-400">R$ ${service.price.toFixed(2).replace('.', ',')}</span>
                </div>
            `;

            // Criar mensagem de confirmação do WhatsApp para a barbearia
            let msg = `*Novo Agendamento Confirmado - BarberStudio*\n\n`;
            if (service.isKid) {
                msg += `Responsável: ${newBooking.responsibleName}\n`;
                msg += `Criança: ${newBooking.kidName} (${newBooking.kidAge} anos)\n`;
            } else {
                msg += `Cliente: ${clientName}\n`;
            }
            msg += `Telefone: ${clientPhone}\n`;
            msg += `Serviço: ${service.name}\n`;
            msg += `Data: ${bookingDate}\n`;
            msg += `Horário: ${selectedTimeSlot}\n`;
            msg += `Valor: R$ ${service.price.toFixed(2).replace('.', ',')}\n\n`;
            msg += `Olá! Acabei de realizar este agendamento pelo site e gostaria de confirmar!`;

            const waUrl = `https://api.whatsapp.com/send?phone=${barberShopWhatsApp}&text=${encodeURIComponent(msg)}`;
            document.getElementById('btnSendWhatsApp').href = waUrl;

            // Abrir Modal de Confirmação Interativa
            document.getElementById('modalBookingSuccess').classList.remove('hidden');

            renderTimeSlots();
            renderAdminAppointments();
            renderReport();
        }

        function closeBookingSuccessModal() {
            document.getElementById('modalBookingSuccess').classList.add('hidden');
            
            // Reset form fields
            document.getElementById('inputClientName').value = '';
            document.getElementById('inputClientPhone').value = '';
            document.getElementById('inputKidName').value = '';
            document.getElementById('inputKidAge').value = '';
            selectedTimeSlot = null;
            renderTimeSlots();
        }

        /* AUTENTICAÇÃO / SENHA E NAVEGAÇÃO DO ADMINISTRADOR */
        function openAdminAuthModal() {
            if (isAdminAuthenticated) {
                showAdminPanel();
            } else {
                document.getElementById('modalAdminAuth').classList.remove('hidden');
            }
        }

        function closeAdminAuthModal() {
            document.getElementById('modalAdminAuth').classList.add('hidden');
        }

        function authenticateAdmin() {
            const pwd = document.getElementById('inputAdminPassword').value;
            if (pwd === "123") {
                isAdminAuthenticated = true;
                closeAdminAuthModal();
                showAdminPanel();
                showToast("Acesso Permitido", "Bem-vindo ao Painel Administrativo!");
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
            showToast("Sessão Encerrada", "Você saiu do Painel Administrativo.");
        }

        function switchAdminTab(tabName) {
            const tabs = ['agendamentos', 'financeiro', 'servicos'];
            tabs.forEach(t => {
                const btn = document.getElementById(`adminNav${t.charAt(0).toUpperCase() + t.slice(1)}`);
                const content = document.getElementById(`adminTab${t.charAt(0).toUpperCase() + t.slice(1)}`);
                
                if (t === tabName) {
                    btn.className = "w-full px-4 py-3 rounded-2xl font-semibold text-xs flex items-center gap-3 transition bg-amber-500 text-slate-950 shadow-md";
                    content.classList.remove('hidden');
                } else {
                    btn.className = "w-full px-4 py-3 rounded-2xl font-semibold text-xs flex items-center gap-3 transition text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800";
                    content.classList.add('hidden');
                }
            });
        }

        /* GESTÃO E AUTOMAÇÃO DE AGENDAMENTOS ADMINISTRATIVOS */
        function renderAdminAppointments() {
            const table = document.getElementById('adminAppointmentsTable');
            const filter = document.getElementById('adminStatusFilter').value;

            // Ordena os agendamentos para exibir os novos (mais recentes) sempre no topo
            const sortedAppointments = [...appointments].sort((a, b) => b.id - a.id);
            const filtered = sortedAppointments.filter(a => filter === 'todos' || a.status === filter);

            if (filtered.length === 0) {
                table.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">Nenhum agendamento encontrado.</td></tr>`;
                return;
            }

            table.innerHTML = filtered.map(a => {
                let badgeClass = "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400";
                if (a.status === 'Concluído') badgeClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400";
                if (a.status === 'Em Atraso') badgeClass = "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400";
                if (a.status === 'Cancelado') badgeClass = "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700";

                return `
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                        <td class="py-3 px-4">
                            <div class="font-bold text-slate-900 dark:text-white">${a.clientName}</div>
                            <div class="text-[11px] text-slate-400">${a.clientPhone}</div>
                            ${a.isKid ? `<span class="inline-block mt-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 font-semibold text-[10px]"><i class="fa-solid fa-child mr-1"></i>Criança: ${a.kidName} (${a.kidAge} anos)</span>` : ''}
                            ${a.status === 'Cancelado' && a.cancelReason ? `
                                <div class="mt-1.5 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-medium">
                                    <i class="fa-solid fa-circle-info mr-1"></i><strong>Motivo do Cancelamento:</strong> ${a.cancelReason}
                                </div>
                            ` : ''}
                        </td>
                        <td class="py-3 px-4 font-medium">${a.serviceName}</td>
                        <td class="py-3 px-4 font-mono">${a.date}<br><span class="font-bold text-amber-500">${a.time}</span></td>
                        <td class="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">R$ ${a.price.toFixed(2).replace('.', ',')}</td>
                        <td class="py-3 px-4">
                            <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${badgeClass}">
                                ${a.status}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-right space-x-1">
                            ${a.status !== 'Cancelado' ? `
                                <button onclick="updateAppointmentStatus(${a.id}, 'Concluído')" class="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition" title="Marcar como Concluído">
                                    <i class="fa-solid fa-check"></i>
                                </button>
                                <button onclick="updateAppointmentStatus(${a.id}, 'Em Atraso')" class="p-2 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition" title="Marcar como Em Atraso">
                                    <i class="fa-solid fa-clock"></i>
                                </button>
                            ` : '<span class="text-slate-400 text-[11px] italic">Sem ações</span>'}
                        </td>
                    </tr>
                `;
            }).join('');
        }

        function updateAppointmentStatus(id, newStatus) {
            const app = appointments.find(a => a.id === id);
            if (!app) return;

            app.status = newStatus;
            
            if (newStatus === 'Concluído') {
                app.completedDate = getTodayString();
                showToast("Status Atualizado", `Agendamento de ${app.clientName} concluído com sucesso! Faturamento atualizado.`);
            } else if (newStatus === 'Em Atraso') {
                // Mensagem de Automação de Atraso do WhatsApp
                const delayMsg = `Olá ${app.clientName}, notamos um pequeno atraso em seu agendamento das ${app.time}. Poderia nos confirmar seu horário?`;
                const cleanPhone = app.clientPhone.replace(/\D/g, '');
                const waUrl = `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(delayMsg)}`;
                window.open(waUrl, '_blank');
                showToast("Aviso enviado", "Enviando notificação automática de atraso via WhatsApp...");
            }

            renderAdminAppointments();
            renderReport();
        }

        /* CLIENTE / MEUS AGENDAMENTOS / FUNÇÕES */
        function openMyAppointmentsModal() {
            document.getElementById('modalMyAppointments').classList.remove('hidden');
            if (activeClientPhone) {
                renderClientAppointmentsList();
            } else {
                document.getElementById('clientPhoneLoginForm').classList.remove('hidden');
                document.getElementById('clientAppointmentsContainer').classList.add('hidden');
            }
        }

        function closeMyAppointmentsModal() {
            document.getElementById('modalMyAppointments').classList.add('hidden');
        }

        function searchClientAppointments() {
            const rawPhone = document.getElementById('inputClientSearchPhone').value.trim();
            const cleanInput = rawPhone.replace(/\D/g, '');

            if (!cleanInput || cleanInput.length < 8) {
                showToast("Telefone Inválido", "Digite um número de telefone válido.", "error");
                return;
            }

            activeClientPhone = cleanInput;
            document.getElementById('loggedPhoneDisplay').innerText = rawPhone;
            document.getElementById('clientPhoneLoginForm').classList.add('hidden');
            document.getElementById('clientAppointmentsContainer').classList.remove('hidden');

            renderClientAppointmentsList();
        }

        function logoutClientSession() {
            activeClientPhone = null;
            document.getElementById('inputClientSearchPhone').value = '';
            document.getElementById('clientPhoneLoginForm').classList.remove('hidden');
            document.getElementById('clientAppointmentsContainer').classList.add('hidden');
        }

        function renderClientAppointmentsList() {
            const listContainer = document.getElementById('clientAppointmentsList');
            if (!activeClientPhone) return;

            const clientApps = appointments.filter(a => a.clientPhone.replace(/\D/g, '') === activeClientPhone);

            if (clientApps.length === 0) {
                listContainer.innerHTML = `
                    <div class="text-center py-8 space-y-2">
                        <i class="fa-solid fa-calendar-xmark text-3xl text-slate-300 dark:text-slate-700"></i>
                        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Nenhum agendamento encontrado para este telefone.</p>
                    </div>
                `;
                return;
            }

            listContainer.innerHTML = clientApps.map(a => {
                let badgeClass = "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400";
                if (a.status === 'Concluído') badgeClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400";
                if (a.status === 'Em Atraso') badgeClass = "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400";
                if (a.status === 'Cancelado') badgeClass = "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400";

                const canCancel = a.status === 'Pendente' || a.status === 'Em Atraso';

                return `
                    <div class="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                        <div class="flex items-start justify-between">
                            <div>
                                <h4 class="font-bold text-sm text-slate-900 dark:text-white">${a.serviceName}</h4>
                                <div class="text-xs text-slate-400 font-mono"><i class="fa-regular fa-calendar mr-1"></i>${a.date} às <strong class="text-amber-500">${a.time}</strong></div>
                            </div>
                            <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${badgeClass}">
                                ${a.status}
                            </span>
                        </div>

                        ${a.isKid ? `<div class="text-xs text-purple-600 dark:text-purple-400 font-semibold"><i class="fa-solid fa-child mr-1"></i>Criança: ${a.kidName} (${a.kidAge} anos)</div>` : ''}

                        ${a.status === 'Cancelado' && a.cancelReason ? `
                            <div class="text-xs text-rose-500 italic bg-rose-500/5 p-2 rounded-xl border border-rose-500/20">
                                <strong>Motivo informado:</strong> "${a.cancelReason}"
                            </div>
                        ` : ''}

                        <div class="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                            <span class="font-bold text-sm text-emerald-600 dark:text-emerald-400">R$ ${a.price.toFixed(2).replace('.', ',')}</span>
                            ${canCancel ? `
                                <button onclick="openCancelBookingModal(${a.id})" class="text-xs font-bold px-3 py-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl transition flex items-center gap-1.5">
                                    <i class="fa-solid fa-xmark"></i>
                                    <span>Cancelar Horário</span>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }

        /* LÓGICA DE CANCELAMENTO DE RESERVA */
        function openCancelBookingModal(id) {
            document.getElementById('cancelAppointmentId').value = id;
            document.getElementById('inputCancelReason').value = '';
            document.getElementById('modalCancelBooking').classList.remove('hidden');
        }

        function closeCancelBookingModal() {
            document.getElementById('modalCancelBooking').classList.add('hidden');
        }

        function confirmCancelBooking() {
            const id = Number(document.getElementById('cancelAppointmentId').value);
            const reason = document.getElementById('inputCancelReason').value.trim();

            if (!reason) {
                showToast("Motivo Obrigatório", "Informe o motivo do cancelamento.", "error");
                return;
            }

            const app = appointments.find(a => a.id === id);
            if (app) {
                app.status = 'Cancelado';
                app.cancelReason = reason;

                showToast("Agendamento Cancelado", "O horário foi cancelado com sucesso.");
                closeCancelBookingModal();

                renderTimeSlots();
                renderClientAppointmentsList();
                renderAdminAppointments();
                renderReport();
            }
        }

        /* RELATÓRIOS E MÉTRICAS FINANCEIRAS */
        function renderReport() {
            const todayStr = getTodayString();
            
            // Calcule a receita de hoje proveniente dos agendamentos concluídos.
            const todayRevenue = appointments
                .filter(a => a.status === 'Concluído' && a.completedDate === todayStr)
                .reduce((acc, a) => acc + a.price, 0);

            // Receita total para métricas de demonstração
            const totalRevenue = appointments
                .filter(a => a.status === 'Concluído')
                .reduce((acc, a) => acc + a.price, 0);

            document.getElementById('metricRevenueToday').innerText = `R$ ${todayRevenue.toFixed(2).replace('.', ',')}`;
            document.getElementById('metricRevenueWeek').innerText = `R$ ${(totalRevenue * 0.8).toFixed(2).replace('.', ',')}`;
            document.getElementById('metricRevenueMonth').innerText = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;
            document.getElementById('metricRevenueYear').innerText = `R$ ${(totalRevenue * 3.5).toFixed(2).replace('.', ',')}`;

            // Avaria no serviço
            const distList = document.getElementById('serviceDistributionList');
            const completedApps = appointments.filter(a => a.status === 'Concluído');

            if (completedApps.length === 0) {
                distList.innerHTML = `<div class="text-xs text-slate-400">Nenhum serviço concluído registrado ainda.</div>`;
                return;
            }

            distList.innerHTML = services.map(s => {
                const count = completedApps.filter(a => a.serviceId === s.id).length;
                const percentage = completedApps.length > 0 ? (count / completedApps.length) * 100 : 0;
                
                return `
                    <div class="space-y-1">
                        <div class="flex justify-between text-xs font-semibold">
                            <span>${s.name} (${count})</span>
                            <span class="text-amber-500">${percentage.toFixed(0)}%</span>
                        </div>
                        <div class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div class="h-full bg-amber-500" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        /* GESTÃO DE SERVIÇOS ADMINISTRATIVOS */
        function renderAdminServices() {
            const list = document.getElementById('adminServicesList');
            list.innerHTML = services.map(s => `
                <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                            <i class="fa-solid ${s.icon}"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-sm text-slate-900 dark:text-white">${s.name}</h4>
                            <p class="text-xs text-slate-400">${s.duration} min • R$ ${s.price.toFixed(2).replace('.', ',')}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-1">
                        <button onclick="editService(${s.id})" class="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition" title="Editar Serviço">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="deleteService(${s.id})" class="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition" title="Excluir Serviço">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }

        function openNewServiceModal() {
            document.getElementById('editServiceId').value = '';
            document.getElementById('modalServiceTitle').innerText = 'Cadastrar Novo Serviço';
            document.getElementById('newServiceName').value = '';
            document.getElementById('newServicePrice').value = '';
            document.getElementById('newServiceDuration').value = '30';
            document.getElementById('modalNewService').classList.remove('hidden');
        }

        function editService(id) {
            const service = services.find(s => s.id === id);
            if (!service) return;
            document.getElementById('editServiceId').value = service.id;
            document.getElementById('modalServiceTitle').innerText = 'Editar Serviço';
            document.getElementById('newServiceName').value = service.name;
            document.getElementById('newServicePrice').value = service.price;
            document.getElementById('newServiceDuration').value = service.duration;
            document.getElementById('modalNewService').classList.remove('hidden');
        }

        function closeNewServiceModal() {
            document.getElementById('modalNewService').classList.add('hidden');
        }

        function saveNewService() {
            const editId = document.getElementById('editServiceId').value;
            const name = document.getElementById('newServiceName').value.trim();
            const price = parseFloat(document.getElementById('newServicePrice').value);
            const duration = parseInt(document.getElementById('newServiceDuration').value);

            if (!name || isNaN(price)) {
                showToast("Dados Incompletos", "Preencha o nome e o preço corretamente.", "error");
                return;
            }

            if (editId) {
                const service = services.find(s => s.id === Number(editId));
                if (service) {
                    service.name = name;
                    service.price = price;
                    service.duration = duration;
                    service.isKid = name.toLowerCase().includes("criança");
                }
                showToast("Serviço Atualizado", "As alterações do serviço foram salvas!");
            } else {
                const newService = {
                    id: Date.now(),
                    name: name,
                    price: price,
                    duration: duration,
                    icon: "fa-scissors",
                    isKid: name.toLowerCase().includes("criança")
                };
                services.push(newService);
                showToast("Serviço Salvo", "Novo serviço adicionado ao catálogo!");
            }

            renderServices();
            closeNewServiceModal();
        }

        function deleteService(id) {
            services = services.filter(s => s.id !== id);
            renderServices();
            showToast("Serviço Removido", "O serviço foi removido do catálogo.");
        }

        /* TOAST UTILITY */
        function showToast(title, message, type = 'info') {
            const toast = document.getElementById('toast');
            const toastIcon = document.getElementById('toastIcon');
            const toastTitle = document.getElementById('toastTitle');
            const toastMessage = document.getElementById('toastMessage');

            toastIcon.innerHTML = type === 'error' 
                ? '<i class="fa-solid fa-circle-exclamation text-rose-500"></i>' 
                : '<i class="fa-solid fa-circle-check text-emerald-400"></i>';

            toastTitle.innerText = title;
            toastMessage.innerText = message;

            toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
            setTimeout(() => {
                toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
            }, 3500);
        }
