tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        amber: {
                            500: '#f59e0b',
                            600: '#d97706',
                            700: '#b45309',
                        }
                    }
                }
            }
        }

// Data Models & State
        const SERVICES = [
            { id: 'cabelo', name: 'Apenas Cabelo', price: 35.00, duration: '30 min', durationMinutes: 30, icon: 'fa-scissors' },
            { id: 'cabelo_crianca', name: 'Corte Cabelo Infantil', price: 35.00, duration: '30 min', durationMinutes: 30, icon: 'fa-child' },
            { id: 'cabelo_barba', name: 'Cabelo e Barba', price: 60.00, duration: '50 min', durationMinutes: 60, icon: 'fa-user-tie' },
            { id: 'completo', name: 'Cabelo + Barba + Sobrancelha', price: 75.00, duration: '60 min', durationMinutes: 60, icon: 'fa-crown' },
            { id: 'barba', name: 'Apenas Barba', price: 30.00, duration: '25 min', durationMinutes: 30, icon: 'fa-user' },
            { id: 'sobrancelha', name: 'Apenas Sobrancelha', price: 15.00, duration: '15 min', durationMinutes: 30, icon: 'fa-eye' }
        ];

        // Helper para obter a data local no formato YYYY-MM-DD sem distorção de fuso horário
        function getTodayString() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        // Seed Initial Data with various dates
        let bookings = JSON.parse(localStorage.getItem('barber_bookings')) || [
            {
                id: '1',
                clientName: 'Matheus Oliveira',
                clientPhone: '(75) 99888-1122',
                serviceId: 'completo',
                serviceName: 'Cabelo + Barba + Sobrancelha',
                price: 75.00,
                date: getTodayString(),
                completedDate: getTodayString(),
                time: '10:00',
                status: 'Concluído'
            },
            {
                id: '2',
                clientName: 'Lucas Ferreira',
                childName: 'Enzo Ferreira',
                childAge: '6',
                clientPhone: '(75) 98123-4567',
                serviceId: 'cabelo_crianca',
                serviceName: 'Corte Cabelo Criança',
                price: 35.00,
                date: getTodayString(),
                time: '09:00',
                status: 'Em Atraso'
            },
            {
                id: '3',
                clientName: 'Gabriel Santos',
                clientPhone: '(75) 99111-2233',
                serviceId: 'cabelo',
                serviceName: 'Apenas Cabelo',
                price: 35.00,
                date: getTodayString(),
                time: '15:30',
                status: 'Agendado'
            }
        ];

        let selectedService = SERVICES[0];
        let selectedTime = null;
        let isAdminLoggedIn = false;
        let currentReportPeriod = 'day';
        let isStoreOpen = JSON.parse(localStorage.getItem('barber_is_open')) ?? true;

        // Initialize App
        window.onload = function() {
            renderServices();
            setMinDate();
            renderAdminBookings();
            updateDashboardStats();
            renderReport();
            updateStoreStatusUI();
            toggleChildAgeField();
        };

        // Theme Toggle Functionality
        function toggleTheme() {
            const html = document.documentElement;
            const icon = document.getElementById('themeIcon');
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                icon.className = 'fa-solid fa-sun text-lg';
            } else {
                html.classList.add('dark');
                icon.className = 'fa-solid fa-moon text-lg';
            }
        }

        function updateSummaryPrice() {
            const summaryElem = document.getElementById('summaryPrice');
            if (summaryElem && selectedService) {
                summaryElem.textContent = `R$ ${selectedService.price.toFixed(2).replace('.', ',')}`;
            }
        }

        // Render Services List in Public View
        function renderServices() {
            const grid = document.getElementById('servicesGrid');
            if (!grid) return;

            grid.innerHTML = SERVICES.map(service => `
                <div onclick="selectService('${service.id}')" id="service-card-${service.id}" 
                     class="service-card border-2 cursor-pointer rounded-xl p-4 transition duration-200 flex items-center justify-between ${service.id === selectedService.id ? 'border-amber-500 bg-amber-500/5' : 'border-gray-200 dark:border-gray-800 hover:border-amber-500/50'}">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg">
                            <i class="fa-solid ${service.icon}"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-sm">${service.name}</h3>
                            <span class="text-xs text-gray-500 dark:text-gray-400"><i class="fa-regular fa-clock mr-1"></i>${service.duration}</span>
                        </div>
                    </div>
                    <span class="font-black text-amber-500 text-sm">R$ ${service.price.toFixed(2).replace('.', ',')}</span>
                </div>
            `).join('');

            updateSummaryPrice();
        }

        function selectService(id) {
            selectedService = SERVICES.find(s => s.id === id);
            selectedTime = null;
            renderServices();
            generateTimeSlots();
            toggleChildAgeField();
        }

        function toggleChildAgeField() {
            const isChild = selectedService && selectedService.id === 'cabelo_crianca';
            const nameLabel = document.getElementById('clientNameLabel');
            const phoneLabel = document.getElementById('clientPhoneLabel');
            const childFields = document.getElementById('childFieldsContainer');
            const childNameInput = document.getElementById('childName');
            const childAgeInput = document.getElementById('childAge');

            if (isChild) {
                if (nameLabel) nameLabel.textContent = 'Nome do Responsável pela criança';
                if (phoneLabel) phoneLabel.textContent = 'Telefone do responsável pela criança';
                if (childFields) childFields.classList.remove('hidden');
                if (childNameInput) childNameInput.required = true;
                if (childAgeInput) childAgeInput.required = true;
            } else {
                if (nameLabel) nameLabel.textContent = 'Nome Completo';
                if (phoneLabel) phoneLabel.textContent = 'Telefone (WhatsApp)';
                if (childFields) childFields.classList.add('hidden');
                if (childNameInput) {
                    childNameInput.required = false;
                    childNameInput.value = '';
                }
                if (childAgeInput) {
                    childAgeInput.required = false;
                    childAgeInput.value = '';
                }
            }
        }

        function setMinDate() {
            const dateInput = document.getElementById('bookingDate');
            if (dateInput) {
                const today = getTodayString();
                dateInput.min = today;
                if (!dateInput.value) {
                    dateInput.value = today;
                }
                generateTimeSlots();
            }
        }

        function generateTimeSlots() {
            const dateInput = document.getElementById('bookingDate');
            const container = document.getElementById('timeSlotsGrid');
            if (!container) return;

            if (!dateInput || !dateInput.value) {
                container.innerHTML = '<p class="col-span-3 text-xs text-gray-400 italic">Selecione uma data primeiro.</p>';
                return;
            }

            const selectedDateStr = dateInput.value;
            const todayStr = getTodayString();
            
            // Gerar intervalos de 30 minutos das 08:00 até 18:30
            const startMinutes = 8 * 60; // 08:00
            const endMinutes = 18 * 60 + 30; // 18:30

            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();

            const dateBookings = bookings.filter(b => b.date === selectedDateStr);

            let html = '';
            const duration = selectedService ? selectedService.durationMinutes : 30;

            for (let timeMins = startMinutes; timeMins <= endMinutes; timeMins += 30) {
                const hours = Math.floor(timeMins / 60).toString().padStart(2, '0');
                const mins = (timeMins % 60).toString().padStart(2, '0');
                const timeStr = `${hours}:${mins}`;

                const isPast = (selectedDateStr === todayStr && timeMins <= currentMinutes);
                const slotEnd = timeMins + duration;
                const exceedsClose = slotEnd > (19 * 60); // Barbearia fecha às 19:00

                const isBooked = dateBookings.some(b => {
                    const bServ = SERVICES.find(s => s.id === b.serviceId);
                    const bDuration = bServ ? bServ.durationMinutes : 30;
                    const [bH, bM] = b.time.split(':').map(Number);
                    const bStart = bH * 60 + bM;
                    const bEnd = bStart + bDuration;

                    return (timeMins < bEnd && slotEnd > bStart);
                });

                const isDisabled = isPast || isBooked || exceedsClose;
                const isSelected = selectedTime === timeStr;

                let btnClass = 'p-2.5 text-xs font-bold rounded-xl border transition text-center ';
                if (isSelected) {
                    btnClass += 'bg-amber-500 text-gray-950 border-amber-500 shadow-md ring-2 ring-amber-500/50';
                } else if (isDisabled) {
                    btnClass += 'bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-600 cursor-not-allowed line-through opacity-60';
                } else {
                    btnClass += 'bg-gray-50 border-gray-200 text-gray-700 hover:border-amber-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 hover:bg-amber-500/10 cursor-pointer';
                }

                html += `<button type="button" ${isDisabled ? 'disabled' : ''} onclick="selectTime('${timeStr}')" class="${btnClass}">${timeStr}</button>`;
            }

            container.innerHTML = html;
        }

        function selectTime(timeStr) {
            selectedTime = timeStr;
            generateTimeSlots();
        }

        function maskPhone(input) {
            let value = input.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            if (value.length > 10) {
                value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
            } else if (value.length > 6) {
                value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
            } else if (value.length > 2) {
                value = value.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
            } else if (value.length > 0) {
                value = value.replace(/^(\d*)$/, '($1');
            }
            input.value = value;
        }

        function saveBookings() {
            localStorage.setItem('barber_bookings', JSON.stringify(bookings));
        }

        // Handle Booking Submission
        function handleBookingSubmit(event) {
            event.preventDefault();

            if (!isStoreOpen) {
                alert('A barbearia está FECHADA no momento para novos agendamentos.');
                return;
            }

            if (!selectedTime) {
                alert('Por favor, selecione um horário para o agendamento.');
                return;
            }

            const clientName = document.getElementById('clientName').value;
            const clientPhone = document.getElementById('clientPhone').value;
            const date = document.getElementById('bookingDate').value;
            const isChild = selectedService.id === 'cabelo_crianca';
            const childName = isChild ? document.getElementById('childName').value : null;
            const childAge = isChild ? document.getElementById('childAge').value : null;

            const newBooking = {
                id: Date.now().toString(),
                clientName,
                childName,
                childAge,
                clientPhone,
                serviceId: selectedService.id,
                serviceName: selectedService.name,
                price: selectedService.price,
                date,
                time: selectedTime,
                status: 'Agendado'
            };

            bookings.unshift(newBooking);
            saveBookings();

            // Prepare WhatsApp simulated message
            const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');
            const childDetail = isChild ? `\n👨‍👦 *Responsável:* ${clientName}\n👦 *Criança:* ${childName} (${childAge} anos)` : `\n👤 *Cliente:* ${clientName}`;
            const whatsappMsg = `Olá, seu agendamento na *BarberStudio* foi realizado com sucesso!\n\n` +
                                `✂️ *Serviço:* ${selectedService.name}${childDetail}\n` +
                                `📅 *Data:* ${formattedDate}\n` +
                                `⏰ *Horário:* ${selectedTime}\n` +
                                `💵 *Valor:* R$ ${selectedService.price.toFixed(2).replace('.', ',')}\n\n` +
                                `Agradecemos a preferência! Te aguardamos.`;

            document.getElementById('whatsappPreviewText').innerText = whatsappMsg;
            document.getElementById('confirmationModal').classList.remove('hidden');

            // Reset Form
            document.getElementById('bookingForm').reset();
            selectedTime = null;
            setMinDate();
            renderAdminBookings();
            updateDashboardStats();
            renderReport();
            toggleChildAgeField();
        }

        // Navigation and Modal Helpers
        function switchView(view) {
            const publicView = document.getElementById('publicView');
            const adminView = document.getElementById('adminView');
            if (view === 'admin') {
                if (!isAdminLoggedIn) {
                    document.getElementById('loginModal').classList.remove('hidden');
                } else {
                    publicView.classList.add('hidden');
                    adminView.classList.remove('hidden');
                }
            } else {
                publicView.classList.remove('hidden');
                adminView.classList.add('hidden');
            }
        }

        function handleAdminAccessClick() {
            if (isAdminLoggedIn) {
                switchView('admin');
            } else {
                document.getElementById('loginModal').classList.remove('hidden');
            }
        }

        function handleAdminLogin(event) {
            event.preventDefault();
            const passwordInput = document.getElementById('adminPassword');
            if (passwordInput.value === '123456') {
                isAdminLoggedIn = true;
                closeLoginModal();
                switchView('admin');
                passwordInput.value = '';
            } else {
                alert('Senha incorreta! Tente novamente. (Senha de teste: 123456)');
            }
        }

        function closeLoginModal() {
            document.getElementById('loginModal').classList.add('hidden');
        }

        function closeConfirmationModal() {
            document.getElementById('confirmationModal').classList.add('hidden');
        }

        function logoutAdmin() {
            isAdminLoggedIn = false;
            switchView('public');
        }

        function toggleStoreStatus() {
            isStoreOpen = !isStoreOpen;
            localStorage.setItem('barber_is_open', JSON.stringify(isStoreOpen));
            updateStoreStatusUI();
        }

        function updateStoreStatusUI() {
            const btn = document.getElementById('storeStatusBtn');
            const dot = document.getElementById('storeStatusDot');
            const text = document.getElementById('storeStatusText');
            const badge = document.getElementById('publicStoreStatusBadge');

            if (isStoreOpen) {
                if (btn) btn.className = 'text-xs font-bold px-3.5 py-2 rounded-xl border transition flex items-center space-x-2 shadow-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
                if (dot) dot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse';
                if (text) text.textContent = 'Status: ABERTO';
                if (badge) {
                    badge.className = 'px-3 py-1 text-xs rounded-full font-bold border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
                    badge.textContent = 'Aberto Agora';
                }
            } else {
                if (btn) btn.className = 'text-xs font-bold px-3.5 py-2 rounded-xl border transition flex items-center space-x-2 shadow-sm bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30';
                if (dot) dot.className = 'w-2.5 h-2.5 rounded-full bg-red-500';
                if (text) text.textContent = 'Status: FECHADO';
                if (badge) {
                    badge.className = 'px-3 py-1 text-xs rounded-full font-bold border bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
                    badge.textContent = 'Fechado no momento';
                }
            }
        }

        // Admin Bookings Table Rendering
        function renderAdminBookings() {
            const tbody = document.getElementById('adminBookingsTable');
            const filterElem = document.getElementById('statusFilter');
            if (!tbody || !filterElem) return;

            const filter = filterElem.value;
            const filteredBookings = bookings.filter(b => filter === 'all' || b.status === filter);

            if (filteredBookings.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-gray-400 italic">Nenhum agendamento encontrado.</td></tr>`;
                return;
            }

            tbody.innerHTML = filteredBookings.map(b => {
                const formattedDate = new Date(b.date + 'T00:00:00').toLocaleDateString('pt-BR');
                
                let badgeClass = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
                if (b.status === 'Concluído') badgeClass = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
                if (b.status === 'Em Atraso') badgeClass = 'bg-red-500/10 text-red-500 border-red-500/20';

                return `
                    <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition">
                        <td class="py-4 px-6">
                            <div class="font-bold text-gray-900 dark:text-white flex items-center space-x-1.5 flex-wrap">
                                <span>${b.clientName}</span>
                                ${b.childName ? `<span class="text-[10px] text-gray-400 font-normal">(Responsável)</span>` : ''}
                            </div>
                            ${b.childName ? `
                                <div class="text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center mt-0.5">
                                    <i class="fa-solid fa-child mr-1"></i> Criança: ${b.childName} (${b.childAge} anos)
                                </div>
                            ` : ''}
                            <div class="text-xs text-gray-400 mt-0.5"><i class="fa-brands fa-whatsapp text-emerald-500 mr-1"></i>${b.clientPhone}</div>
                        </td>
                        <td class="py-4 px-6 font-medium">${b.serviceName}</td>
                        <td class="py-4 px-6 text-xs text-gray-500 dark:text-gray-400">
                            <div><i class="fa-regular fa-calendar mr-1"></i>${formattedDate}</div>
                            <div class="font-semibold text-gray-700 dark:text-gray-300 mt-0.5"><i class="fa-regular fa-clock mr-1"></i>${b.time}</div>
                        </td>
                        <td class="py-4 px-6 font-bold text-amber-500">R$ ${b.price.toFixed(2).replace('.', ',')}</td>
                        <td class="py-4 px-6">
                            <span class="px-2.5 py-1 text-xs font-bold rounded-full border ${badgeClass}">
                                ${b.status}
                            </span>
                        </td>
                        <td class="py-4 px-6 text-right space-x-1">
                            ${b.status !== 'Concluído' ? `
                                <button onclick="updateBookingStatus('${b.id}', 'Concluído')" title="Marcar como Concluído" class="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition">
                                    <i class="fa-solid fa-check text-xs"></i>
                                </button>
                            ` : ''}
                            ${b.status !== 'Em Atraso' ? `
                                <button onclick="updateBookingStatus('${b.id}', 'Em Atraso')" title="Marcar como Em Atraso" class="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition">
                                    <i class="fa-solid fa-clock-rotate-left text-xs"></i>
                                </button>
                            ` : ''}
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Update Booking Status & Trigger Auto WhatsApp on Overdue
        function updateBookingStatus(id, newStatus) {
            const booking = bookings.find(b => b.id === id);
            if (!booking) return;

            booking.status = newStatus;

            if (newStatus === 'Concluído') {
                booking.completedDate = getTodayString();
            }

            saveBookings();
            renderAdminBookings();
            updateDashboardStats();
            renderReport();

            if (newStatus === 'Em Atraso') {
                triggerWhatsappToast(`Aviso de atraso enviado para ${booking.clientName}: "Olá ${booking.clientName}, notamos um atraso em seu agendamento das ${booking.time}. Podemos remarcar?"`);
            }
        }

        function triggerWhatsappToast(message) {
            const toast = document.getElementById('whatsappToast');
            const toastText = document.getElementById('whatsappToastText');
            if (!toast || !toastText) return;

            toastText.textContent = message;
            toast.classList.remove('translate-y-20', 'opacity-0');

            setTimeout(() => {
                toast.classList.add('translate-y-20', 'opacity-0');
            }, 5000);
        }

        // Update Dashboard Summary Stats
        function updateDashboardStats() {
            const totalElem = document.getElementById('statTotalBookings');
            const compElem = document.getElementById('statCompletedBookings');
            const overElem = document.getElementById('statOverdueBookings');
            const revElem = document.getElementById('statTotalRevenue');

            if (totalElem) totalElem.textContent = bookings.length;
            
            const completed = bookings.filter(b => b.status === 'Concluído');
            if (compElem) compElem.textContent = completed.length;

            const overdue = bookings.filter(b => b.status === 'Em Atraso');
            if (overElem) overElem.textContent = overdue.length;

            const totalRevenue = completed.reduce((sum, b) => sum + b.price, 0);
            if (revElem) revElem.textContent = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;
        }

        // Sales Reports Logic (Day, Week, Month, Year)
        function setReportPeriod(period) {
            currentReportPeriod = period;
            
            ['Day', 'Week', 'Month', 'Year'].forEach(p => {
                const btn = document.getElementById(`btnReport${p}`);
                if (btn) {
                    if (p.toLowerCase() === period) {
                        btn.className = 'px-3 py-1.5 rounded-lg transition bg-amber-500 text-gray-950 font-bold shadow';
                    } else {
                        btn.className = 'px-3 py-1.5 rounded-lg transition text-gray-500 hover:text-gray-900 dark:hover:text-white';
                    }
                }
            });

            renderReport();
        }

        function renderReport() {
            const completed = bookings.filter(b => b.status === 'Concluído');
            const todayStr = getTodayString();
            const today = new Date();

            let filtered = completed.filter(b => {
                const bDateStr = b.completedDate || b.date;
                const bDate = new Date(bDateStr + 'T00:00:00');
                if (currentReportPeriod === 'day') {
                    return bDateStr === todayStr || bDate.toDateString() === today.toDateString();
                } else if (currentReportPeriod === 'week') {
                    const diffTime = Math.abs(today - bDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= 7;
                } else if (currentReportPeriod === 'month') {
                    return bDate.getMonth() === today.getMonth() && bDate.getFullYear() === today.getFullYear();
                } else if (currentReportPeriod === 'year') {
                    return bDate.getFullYear() === today.getFullYear();
                }
                return true;
            });

            const totalAmount = filtered.reduce((sum, b) => sum + b.price, 0);
            const periodTitles = {
                day: 'Faturamento Hoje',
                week: 'Faturamento Esta Semana',
                month: 'Faturamento Este Mês',
                year: 'Faturamento Este Ano'
            };

            const titleElem = document.getElementById('reportPeriodTitle');
            const amountElem = document.getElementById('reportAmount');
            const countElem = document.getElementById('reportCount');

            if (titleElem) titleElem.textContent = periodTitles[currentReportPeriod];
            if (amountElem) amountElem.textContent = `R$ ${totalAmount.toFixed(2).replace('.', ',')}`;
            if (countElem) countElem.textContent = `${filtered.length} corte(s) concluído(s) no período`;

            const breakdownGrid = document.getElementById('serviceBreakdown');
            if (!breakdownGrid) return;

            if (filtered.length === 0) {
                breakdownGrid.innerHTML = `<p class="text-xs text-gray-400 italic">Sem vendas registradas neste período.</p>`;
                return;
            }

            const counts = {};
            SERVICES.forEach(s => counts[s.name] = 0);
            filtered.forEach(b => {
                counts[b.serviceName] = (counts[b.serviceName] || 0) + 1;
            });

            const maxCount = Math.max(...Object.values(counts), 1);

            breakdownGrid.innerHTML = Object.entries(counts).map(([name, count]) => {
                const pct = (count / maxCount) * 100;
                return `
                    <div>
                        <div class="flex justify-between text-xs font-semibold mb-1">
                            <span>${name}</span>
                            <span class="text-amber-500">${count} un.</span>
                        </div>
                        <div class="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                            <div class="bg-amber-500 h-full rounded-full transition-all duration-500" style="width: ${pct}%"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }