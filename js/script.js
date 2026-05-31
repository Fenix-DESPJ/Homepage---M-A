document.addEventListener("DOMContentLoaded", async () => {
    
    // --- 1. LÓGICA DE CARGA DE COMPONENTES ---
    async function cargarComponente(id, url) {
        const contenedor = document.getElementById(id);
        if (contenedor) {
            try {
                // Ruta relativa sin / inicial para compatibilidad total
                const response = await fetch(url);
                if (response.ok) {
                    contenedor.innerHTML = await response.text();
                    
                    if (id === 'navbar-container') inicializarNavbar();
                    
                    if (id === 'main-content') {
                        if (document.querySelector('.barbers-track')) {
                            inicializarCarousel();
                        }
                    }
                }
            } catch (err) {
                console.error("Error cargando componente:", err);
            }
        }
    }

    // Rutas relativas al archivo que carga el script
    if (document.getElementById('navbar-container')) cargarComponente('navbar-container', 'componentes/navbar.html');
    if (document.getElementById('footer-container')) cargarComponente('footer-container', 'componentes/footer.html');
    if (document.getElementById('main-content')) cargarComponente('main-content', 'secciones/info.html');
    if (document.getElementById('servicios-content')) cargarComponente('servicios-content', 'secciones/servicios.html');

    // --- 2. INICIALIZAR OTROS ELEMENTOS ---
    if (document.querySelector('.barbers-track')) inicializarCarousel();

    // --- 3. LÓGICA DE REGISTRO ---
    const formRegistro = document.getElementById('registro-form');
    if (formRegistro) {
        formRegistro.addEventListener('submit', (e) => {
            e.preventDefault();
            const nuevoUsuario = { 
                nombre: document.getElementById('nombre').value,
                apellido: document.getElementById('apellido').value,
                fecha: document.getElementById('fecha').value,
                email: document.getElementById('correo').value,
                telefono: document.getElementById('telefono').value,
                password: document.getElementById('password').value
            };
            localStorage.setItem('usuarioRegistrado', JSON.stringify(nuevoUsuario));
            alert("Registro exitoso.");
            // Redirección relativa
            window.location.href = 'iniciarsesion.html';
        });
    }

    // --- 4. LÓGICA DE LOGIN ---
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputUsuario = document.getElementById('usuario').value;
            const inputPass = document.getElementById('password').value;
            const guardado = JSON.parse(localStorage.getItem('usuarioRegistrado'));

            if (guardado && (inputUsuario === guardado.email || inputUsuario === guardado.telefono) && inputPass === guardado.password) {
                localStorage.setItem('sesionActiva', JSON.stringify(guardado));
                // Redirección relativa a la raíz
                window.location.href = '../index.html';
            } else {
                alert('Usuario, teléfono o contraseña incorrectos');
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
            if (mobileExtra) {
                mobileExtra.innerHTML = `
                    <hr class="text-white">
                    <li class="nav-item"><a class="nav-link" href="#">👤 Mi Perfil</a></li>
                    <li class="nav-item"><a class="nav-link" href="#">📅 Mis Reservas</a></li>
                    <li class="nav-item"><button onclick="cerrarSesion()" class="nav-link text-danger border-0 bg-transparent w-100">Cerrar Sesión</button></li>
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
            <a href="#">👤 Mi Perfil</a>
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

async function cargarSeccion(archivo, seccionId = null) {
    const mainContent = document.getElementById('main-content');
    const estamosEnInicio = document.getElementById('inicio') !== null;
    if (estamosEnInicio && archivo === 'info.html') {
        if (seccionId) document.querySelector(seccionId)?.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        try {
            const response = await fetch(`secciones/${archivo}`);
            if (!response.ok) throw new Error("No encontrado");
            mainContent.innerHTML = await response.text();
            if (seccionId) {
                setTimeout(() => document.querySelector(seccionId)?.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        } catch (err) { console.error("Error al cargar la sección:", err); }
    }
    const menu = document.getElementById('menu');
    if (menu && menu.classList.contains('show')) {
        const bsCollapse = new bootstrap.Collapse(menu);
        bsCollapse.hide();
    }
}