document.addEventListener("DOMContentLoaded", async () => {

    // --- VARIABLES GLOBALES PARA MODALES ---
    let pseModal, cardModal, successModal, reservationToast;

    // --- 1. LÓGICA DE CARGA DE COMPONENTES ---
    async function cargarComponente(id, url) {
        const contenedor = document.getElementById(id);
        if (contenedor) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    contenedor.innerHTML = await response.text();
                    
                    // Inicializaciones post-carga
                    if (id === 'navbar-container') inicializarNavbar();
                    
                    if (id === 'main-content') {
                        if (document.querySelector('.barbers-track')) inicializarCarousel();
                        if (url.includes('reservas.html')) inicializarLogicaReserva();
                    }
                }
            } catch (err) {
                console.error("Error cargando componente:", err);
            }
        }
    }

    // Cargas iniciales
    if (document.getElementById('navbar-container')) cargarComponente('navbar-container', '../navbar.html');
    if (document.getElementById('footer-container')) cargarComponente('footer-container', '../componentes/footer.html');
    if (document.getElementById('main-content')) cargarComponente('main-content', '../secciones/info.html');
    
    // --- 2. GESTIÓN DE RESERVA (Nueva Lógica) ---
    window.gestionarReserva = function(event) {
        event.preventDefault();
        const sesion = JSON.parse(localStorage.getItem('sesionActiva'));
        
        if (sesion) {
            // En lugar de redirigir, "inyectamos" el HTML en el main
            cargarComponente('main-content', '../secciones/reservas.html');
        } else {
            window.location.href = '/secciones/agenda.html';
        }
    };

    // --- 3. LÓGICA DE RESERVA (Aislada) ---
    function inicializarLogicaReserva() {
        const servicio = document.getElementById("servicio");
        if (!servicio) return;

        // Inicializar modales de Bootstrap
        if (!pseModal) {
            pseModal = new bootstrap.Modal(document.getElementById("pseModal"));
            cardModal = new bootstrap.Modal(document.getElementById("cardModal"));
            successModal = new bootstrap.Modal(document.getElementById("successModal"));
            reservationToast = new bootstrap.Toast(document.getElementById("reservationToast"), { delay: 3000 });
        }

        // Selección y lógica...
        console.log("Lógica de reserva inicializada");
        // Aseguramos que se inyecte también la lógica del otro módulo si es necesario
        inicializarModuloReservas();
    }

    // --- 4. LÓGICA DE LOGIN Y REGISTRO (Tu código original) ---
    const formRegistro = document.getElementById('registro-form');
    if (formRegistro) {
        formRegistro.addEventListener('submit', (e) => {
            e.preventDefault();
            const nuevoUsuario = { 
                nombre: document.getElementById('nombre').value,
                apellido: document.getElementById('apellido').value,
                email: document.getElementById('correo').value,
                password: document.getElementById('password').value
            };
            localStorage.setItem('usuarioRegistrado', JSON.stringify(nuevoUsuario));
            alert("Registro exitoso.");
            window.location.href = 'iniciarsesion.html';
        });
    }

    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputUsuario = document.getElementById('usuario').value;
            const inputPass = document.getElementById('password').value;
            const guardado = JSON.parse(localStorage.getItem('usuarioRegistrado'));

            if (guardado && (inputUsuario === guardado.email) && inputPass === guardado.password) {
                localStorage.setItem('sesionActiva', JSON.stringify(guardado));
                window.location.href = '/index.html';
            } else {
                alert('Usuario o contraseña incorrectos');
            }
        });
    }
});

// --- FUNCIONES GLOBALES ---
function inicializarNavbar() {
    const sesion = JSON.parse(localStorage.getItem('sesionActiva'));
    const authLinks = document.getElementById('auth-links');
    const dynamicArea = document.getElementById('dynamic-nav-area');
    const mobileBell = document.getElementById('mobile-bell-container');
    const mobileExtra = document.getElementById('mobile-extra-options');
    const logoContainer = document.getElementById('logo-container');
    const gearIcon = document.getElementById('gear-icon-desktop');

    if (dynamicArea) dynamicArea.innerHTML = '';
    if (mobileBell) mobileBell.innerHTML = '';
    if (mobileExtra) mobileExtra.innerHTML = '';

    const campanaHTML = `
        <div id="bell-wrapper" style="position: relative;">
            <i id="btn-notificaciones" class="bi bi-bell-fill text-warning" style="font-size: 1.2rem; cursor: pointer;"></i>
            <div id="notificaciones-panel">
                <h6 class="border-bottom border-warning pb-2">Notificaciones</h6>
                <div id="lista-notificaciones">No tienes notificaciones nuevas.</div>
            </div>
        </div>
    `;

    const agregarEventoCampana = () => {
        const btn = document.getElementById('btn-notificaciones');
        const panel = document.getElementById('notificaciones-panel');
        if (btn && panel) {
            btn.onclick = (e) => {
                e.stopPropagation();
                panel.classList.toggle('active');
            };
        }
    };

    document.addEventListener('click', (e) => {
        const panel = document.getElementById('notificaciones-panel');
        const btn = document.getElementById('btn-notificaciones');
        if (panel && panel.classList.contains('active') && e.target !== btn) {
            panel.classList.remove('active');
        }
    });

    if (sesion) {
        if (authLinks) authLinks.classList.add('d-none');
        if (!document.getElementById('side-menu')) crearSideMenuDOM(sesion);

        if (window.innerWidth >= 992) {
            if (gearIcon) {
                gearIcon.classList.remove('d-none');
                gearIcon.style.setProperty('display', 'inline-block', 'important');
                gearIcon.onclick = (e) => toggleSideMenu(e);
            }
            if (logoContainer) logoContainer.style.setProperty('display', 'none', 'important');
            if (dynamicArea) {
                dynamicArea.innerHTML = `<span class="text-warning fw-bold px-3">Hola, ${sesion.nombre}</span> ${campanaHTML}`;
                agregarEventoCampana();
            }
        } else {
            if (logoContainer) logoContainer.style.setProperty('display', 'flex', 'important');
            if (mobileBell) {
                mobileBell.innerHTML = campanaHTML;
                agregarEventoCampana();
            }
            if (gearIcon) gearIcon.style.setProperty('display', 'none', 'important');
            // Dentro de inicializarNavbar, en la parte del ELSE (mobileExtra):
            if (mobileExtra) {
                mobileExtra.innerHTML = `
                    <hr class="text-white">
                    <li class="nav-item">
                        <a class="nav-link" href="#" onclick="window.cargarSeccion('perfil.html'); return false;">👤 Mi Perfil</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" onclick="window.cargarSeccion('reservas.html'); return false;">📅 Mis Reservas</a>
                    </li>
                    <li class="nav-item">
                        <button onclick="cerrarSesion()" class="nav-link text-danger border-0 bg-transparent w-100">Cerrar Sesión</button>
                    </li>
                `;
            }
        }
    } else {
        if (authLinks) authLinks.classList.remove('d-none');
        if (logoContainer) logoContainer.style.setProperty('display', 'flex', 'important');
        if (gearIcon) gearIcon.style.setProperty('display', 'none', 'important');
    }
}

window.addEventListener('resize', inicializarNavbar);

function crearSideMenuDOM(sesion) {
    if (document.getElementById('side-menu')) return;
    const menu = document.createElement('div');
    menu.id = 'side-menu';
    menu.innerHTML = `
        <span class="close-menu-btn" onclick="toggleSideMenu(event)">×</span>
        <div class="menu-header">
            <img src="./img/logo.jpeg" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid #FFC600;">
            <h5 class="text-white mt-3">${sesion.nombre}</h5>
        </div>
        <div class="menu-items">
            <a href="#" onclick="window.cargarSeccion('perfil.html'); toggleSideMenu(event);">👤 Mi Perfil</a>
            <a href="#">📅 Mis Reservas</a>
            <button onclick="cerrarSesion()" class="btn btn-outline-danger w-100 mt-4">Cerrar Sesión</button>
        </div>
    `;
    const overlay = document.createElement('div');
    overlay.id = 'menu-overlay';
    overlay.onclick = toggleSideMenu;
    document.body.appendChild(menu);
    document.body.appendChild(overlay);
}

function toggleSideMenu(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const menu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');
    if (menu && overlay) {
        const isActive = menu.classList.toggle('active');
        overlay.style.display = isActive ? 'block' : 'none';
        document.body.style.overflow = isActive ? 'hidden' : '';
    }
}

function inicializarCarousel() {
    const track = document.querySelector('.barbers-track');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    if (!track || !nextBtn || !prevBtn) return;
    const getScrollAmount = () => {
        const firstCard = track.querySelector('.barber-card');
        return firstCard ? firstCard.offsetWidth + 24 : 300;
    };
    nextBtn.addEventListener('click', () => {
        const cardWidth = getScrollAmount();
        track.style.transition = 'transform 0.5s ease-in-out';
        track.style.transform = `translateX(-${cardWidth}px)`;
        track.addEventListener('transitionend', () => {
            track.style.transition = 'none';
            track.appendChild(track.firstElementChild);
            track.style.transform = 'translateX(0)';
        }, { once: true });
    });
    prevBtn.addEventListener('click', () => {
        const cardWidth = getScrollAmount();
        track.insertBefore(track.lastElementChild, track.firstElementChild);
        track.style.transition = 'none';
        track.style.transform = `translateX(-${cardWidth}px)`;
        track.offsetHeight; 
        track.style.transition = 'transform 0.5s ease-in-out';
        track.style.transform = 'translateX(0)';
    });
}

function cerrarSesion() {
    localStorage.removeItem('sesionActiva');
    alert("Has cerrado sesión.");
    window.location.href = './index.html';
}

// En tu script.js, al final del todo, fuera de cualquier otra función:
window.cargarSeccion = async function(archivo) {
    const mainContent = document.getElementById('main-content');
    try {
        const response = await fetch(`./secciones/${archivo}`);
        if (!response.ok) throw new Error("Archivo no encontrado");
        mainContent.innerHTML = await response.text();
        
        // --- NUEVA LÓGICA: Si cargamos el perfil, inicializamos sus campos ---
        if (archivo === 'perfil.html') {
            inicializarLogicaPerfil();
        }
    } catch (err) {
        console.error("Error al cargar:", err);
    }
};

function inicializarLogicaPerfil() {
    const form = document.getElementById('formEditarPerfil');
    const sesion = JSON.parse(localStorage.getItem('sesionActiva'));

    if (!sesion || !form) return;

    // 1. Rellenar campos con los datos almacenados
    // Usamos || '' para evitar que se muestre "undefined" si el dato no existe
    document.getElementById('inputNombre').value = sesion.nombre || '';
    document.getElementById('inputTelefono').value = sesion.telefono || '';
    
    // Seleccionar opciones en los <select>
    if (sesion.genero) document.getElementById('selectGenero').value = sesion.genero;
    if (sesion.mesNac) document.getElementById('selectMes').value = sesion.mesNac;
    if (sesion.diaNac) document.getElementById('selectDia').value = sesion.diaNac;
    if (sesion.anioNac) document.getElementById('selectAnio').value = sesion.anioNac;
    
    // Marcar los checkboxes
    document.getElementById('checkPromociones').checked = !!sesion.promoWpp;
    document.getElementById('checkCitas').checked = !!sesion.citasWpp;

    // 2. Escuchar el evento de envío del formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Actualizar el objeto sesion con los valores actuales del formulario
        sesion.nombre = document.getElementById('inputNombre').value;
        sesion.telefono = document.getElementById('inputTelefono').value;
        sesion.genero = document.getElementById('selectGenero').value;
        sesion.mesNac = document.getElementById('selectMes').value;
        sesion.diaNac = document.getElementById('selectDia').value;
        sesion.anioNac = document.getElementById('selectAnio').value;
        sesion.promoWpp = document.getElementById('checkPromociones').checked;
        sesion.citasWpp = document.getElementById('checkCitas').checked;

        // Guardar cambios en el localStorage
        localStorage.setItem('sesionActiva', JSON.stringify(sesion));
        localStorage.setItem('usuarioRegistrado', JSON.stringify(sesion));

        alert("¡Perfil actualizado correctamente!");
        
        // Refrescar el Navbar para que muestre el nombre actualizado
        inicializarNavbar();
    });
}
function inicializarLogicaPerfil() {
    const form = document.getElementById('formEditarPerfil');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Perfil guardado con éxito");
            // Aquí agregarías la lógica para guardar en localStorage
        });
    }
}

// --- VARIABLES GLOBALES PARA MODALES (Fuera de la función) ---
let pseModal_res, cardModal_res, successModal_res; 

// --- LÓGICA DE RESERVAS (Encapsulada) ---
function inicializarModuloReservas() {
    // 1. SELECTORES
    const calendarDays = document.getElementById("calendarDays");
    const currentMonthYear = document.getElementById("currentMonthYear");
    const prevMonth = document.getElementById("prevMonth");
    const nextMonth = document.getElementById("nextMonth");
    const hoursGrid = document.getElementById("hoursGrid");
    
    // Elementos de resumen y estado
    const summaryService = document.getElementById("summaryService");
    const summaryBarber = document.getElementById("summaryBarber");
    const summaryDate = document.getElementById("summaryDate");
    const summaryHour = document.getElementById("summaryHour");
    const summaryPayment = document.getElementById("summaryPayment");
    const selectedMethodDisplay = document.getElementById("selectedMethodDisplay");

    let estado = { fecha: "", hora: "", metodo: "" };
    let mesOffset = 0; 

    // Inicializar instancias de modales de Bootstrap
    const pseModal = new bootstrap.Modal(document.getElementById("pseModal"));
    const cardModal = new bootstrap.Modal(document.getElementById("cardModal"));
    const successModal = new bootstrap.Modal(document.getElementById("successModal"));

    // 2. FUNCIÓN PARA DIBUJAR EL CALENDARIO
    function renderizarCalendario() {
        const fechaBase = new Date();
        fechaBase.setMonth(fechaBase.getMonth() + mesOffset);
        
        const nombreMes = fechaBase.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        currentMonthYear.textContent = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

        calendarDays.innerHTML = '';
        
        const primerDia = new Date(fechaBase.getFullYear(), fechaBase.getMonth(), 1).getDay();
        const diasEnMes = new Date(fechaBase.getFullYear(), fechaBase.getMonth() + 1, 0).getDate();
        const offset = (primerDia === 0) ? 6 : primerDia - 1;

        for (let i = 0; i < offset; i++) calendarDays.innerHTML += '<span></span>';

        const hoy = new Date();
        hoy.setHours(0,0,0,0);

        for (let i = 1; i <= diasEnMes; i++) {
            const fechaActual = new Date(fechaBase.getFullYear(), fechaBase.getMonth(), i);
            const btn = document.createElement('button');
            btn.className = 'day';
            btn.textContent = i;

            if (fechaActual < hoy) {
                btn.disabled = true;
                btn.classList.add('disabled-day');
            } else {
                btn.addEventListener("click", () => {
                    document.querySelectorAll(".day").forEach(d => d.classList.remove("selected-day"));
                    btn.classList.add("selected-day");
                    estado.fecha = fechaActual.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
                    summaryDate.textContent = estado.fecha;
                });
            }
            calendarDays.appendChild(btn);
        }
    }

    // 3. NAVEGACIÓN MESES
    prevMonth.addEventListener("click", () => { if (mesOffset > 0) { mesOffset--; renderizarCalendario(); } });
    nextMonth.addEventListener("click", () => { if (mesOffset < 1) { mesOffset++; renderizarCalendario(); } });

    // 4. GENERAR HORAS
    const horas = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"];
    hoursGrid.innerHTML = '';
    horas.forEach(hora => {
        const btn = document.createElement('button');
        btn.className = 'hour-card';
        btn.textContent = hora;
        btn.addEventListener("click", () => {
            document.querySelectorAll(".hour-card").forEach(h => h.classList.remove("hour-selected"));
            btn.classList.add("hour-selected");
            estado.hora = hora;
            summaryHour.textContent = hora;
        });
        hoursGrid.appendChild(btn);
    });

    // 5. EVENTOS SELECTS Y PAGOS
    document.getElementById("servicio").addEventListener("change", (e) => summaryService.textContent = e.target.value);
    document.getElementById("barbero").addEventListener("change", (e) => summaryBarber.textContent = e.target.value);

    document.querySelectorAll(".payment-option").forEach(opcion => {
        opcion.addEventListener("click", (e) => {
            e.preventDefault();
            estado.metodo = opcion.dataset.method;
            selectedMethodDisplay.textContent = estado.metodo;
            summaryPayment.textContent = estado.metodo;
        });
    });

    // 6. LÓGICA DEL BOTÓN RESERVAR CON MODALES
    document.getElementById("btnReservar").addEventListener("click", () => {
        if (!estado.fecha || !estado.hora || !estado.metodo) {
            alert("Por favor, selecciona fecha, hora y método de pago.");
        } else {
            if (estado.metodo === "PSE") {
                pseModal.show();
            } else if (estado.metodo === "Tarjeta de Crédito") {
                cardModal.show();
            } else {
                successModal.show();
            }
        }
    });

    // Eventos de botones dentro de los modales
    document.getElementById("btnPagarPSE")?.addEventListener("click", () => {
        pseModal.hide();
        successModal.show();
    });

    document.getElementById("btnPagarCard")?.addEventListener("click", () => {
        cardModal.hide();
        successModal.show();
    });

    renderizarCalendario();
}