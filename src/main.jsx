// Sistema de Portal Municipal - Santa Cruz
class MunicipalPortal {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.init();
    }

    init() {
        this.checkAuthState();
        this.render();
        this.attachEventListeners();
    }

    // Gestión de usuarios
    loadUsers() {
        const defaultUsers = [
            {
                id: 1,
                identification: '12345678',
                password: 'admin123',
                name: 'Administrador Municipal',
                email: 'admin@santacruz.gob.bo',
                role: 'admin',
                identificationType: 'cedula'
            },
            {
                id: 2,
                identification: '87654321',
                password: 'user123',
                name: 'Juan Pérez',
                email: 'juan.perez@email.com',
                role: 'user',
                identificationType: 'cedula'
            }
        ];

        const savedUsers = localStorage.getItem('municipal_users');
        return savedUsers ? JSON.parse(savedUsers) : defaultUsers;
    }

    saveUsers() {
        localStorage.setItem('municipal_users', JSON.stringify(this.users));
    }

    checkAuthState() {
        const savedUser = localStorage.getItem('municipal_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }

    login(identification, password, identificationType) {
        const user = this.users.find(u => 
            u.identification === identification && 
            u.password === password &&
            u.identificationType === identificationType
        );

        if (user) {
            this.currentUser = user;
            localStorage.setItem('municipal_current_user', JSON.stringify(user));
            this.showAlert('Inicio de sesión exitoso', 'success');
            setTimeout(() => this.render(), 1000);
            return true;
        } else {
            this.showAlert('Credenciales incorrectas. Verifique su número de identificación y contraseña.', 'error');
            return false;
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('municipal_current_user');
        this.render();
    }

    register(userData) {
        // Verificar si ya existe un usuario con esa identificación
        const existingUser = this.users.find(u => u.identification === userData.identification);
        if (existingUser) {
            this.showAlert('Ya existe un usuario registrado con ese número de identificación.', 'error');
            return false;
        }

        const newUser = {
            id: Date.now(),
            ...userData,
            role: 'user'
        };

        this.users.push(newUser);
        this.saveUsers();
        this.showAlert('Registro exitoso. Ya puede iniciar sesión.', 'success');
        return true;
    }

    // Renderizado de vistas
    render() {
        const app = document.getElementById('app');
        
        if (this.currentUser) {
            app.innerHTML = this.renderDashboard();
        } else {
            app.innerHTML = this.renderLoginPage();
        }
    }

    renderLoginPage() {
        return `
            <div class="main-container">
                <!-- Header -->
                <header class="main-header">
                    <div class="header-container">
                        <div class="header-left">
                            <div class="municipal-logo">
                                <div class="logo-image">
                                    <i class="fas fa-university"></i>
                                </div>
                                <div class="logo-text">
                                    <h1 class="logo-title">Municipalidad de</h1>
                                    <p class="logo-subtitle">Santa Cruz</p>
                                </div>
                            </div>
                        </div>
                        
                        
                        <div class="header-actions">
                            <a href="#" class="header-btn btn-login" onclick="municipalPortal.showLoginForm()">Iniciar Sesión</a>
                            <a href="#" class="header-btn btn-register" onclick="municipalPortal.showRegisterForm()">Registrarse</a>
                        </div>
                    </div>
                </header>

                <!-- Contenido Principal -->
                <main class="main-content">
                    <div class="content-container">
                        <div class="content-left">
                            <h2 class="welcome-title">Bienvenido a la Municipalidad de Santa Cruz</h2>
                            <p class="welcome-subtitle">Gestiona tus trámites de forma digital</p>
                            <p class="welcome-description">
                                Accede a todos los servicios municipales desde la comodidad de tu hogar. 
                                Realiza trámites, consulta el estado de tus solicitudes y mantente informado 
                                sobre los servicios que ofrece la Municipalidad de Santa Cruz.
                            </p>
                        </div>
                        
                        <div class="content-right">
                            <div class="login-card fade-in">
                                <div class="login-header">
                                    <h3 class="login-title">Iniciar sesión</h3>
                                    <p class="login-subtitle">Seleccione el tipo de identificación</p>
                                </div>
                                
                                <form class="login-form" id="loginForm">
                                    
                                    
                                    <div class="form-group">
                                        <div class="input-with-icon">
                                            <i class="fas fa-user"></i>
                                            <input 
                                                type="text" 
                                                class="form-input" 
                                                id="identification"
                                                placeholder="Correo electrónico"
                                                required
                                            >
                                        </div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <div class="input-with-icon">
                                            <i class="fas fa-lock"></i>
                                            <input 
                                                type="password" 
                                                class="form-input" 
                                                id="password"
                                                placeholder="Contraseña"
                                                required
                                            >
                                        </div>
                                    </div>
                                    
                                    <div class="login-actions">
                                        <button type="submit" class="btn-login-submit">
                                            <span class="btn-text">Ingresar</span>
                                            <span class="loading hidden"></span>
                                        </button>
                                        
                                        <div class="login-links">
                                            <a href="#" class="forgot-password" onclick="municipalPortal.showForgotPassword()">
                                                Recuperar contraseña
                                            </a>
                                            <br>
                                            <a href="#" class="back-link" onclick="municipalPortal.showRegisterForm()">
                                                Volver
                                            </a>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>

                <!-- Footer -->
                <footer class="main-footer">
                    <div class="footer-container">
                        <div class="footer-text">
                            Municipalidad de Santa Cruz © 2025
                        </div>
                        <div class="footer-icons">
                            <a href="#" class="footer-icon" title="Accesibilidad">
                                <i class="fas fa-universal-access"></i>
                            </a>
                            <a href="#" class="footer-icon" title="Aumentar texto">
                                <i class="fas fa-font"></i>
                            </a>
                            <a href="#" class="footer-icon" title="Contraste">
                                <i class="fas fa-adjust"></i>
                            </a>
                            <a href="#" class="footer-icon" title="Ayuda">
                                <i class="fas fa-question-circle"></i>
                            </a>
                            <a href="#" class="footer-icon" title="Información">
                                <i class="fas fa-info-circle"></i>
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        `;
    }

    renderDashboard() {
        const isAdmin = this.currentUser.role === 'admin';
        
        return `
            <div class="dashboard-container">
                <header class="dashboard-header">
                    <nav class="dashboard-nav">
                        <div class="dashboard-logo">
                            <div class="logo-image">
                                <i class="fas fa-university"></i>
                            </div>
                            <div class="logo-text">
                                <h1 class="logo-title">Portal Municipal</h1>
                                <p class="logo-subtitle">Santa Cruz</p>
                            </div>
                        </div>
                        
                        <div class="dashboard-user">
                            <div class="user-info">
                                <p class="user-name">${this.currentUser.name}</p>
                                <p class="user-role">${isAdmin ? 'Administrador' : 'Usuario'}</p>
                            </div>
                            <button class="logout-btn" onclick="municipalPortal.logout()">
                                <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                            </button>
                        </div>
                    </nav>
                </header>
                
                <main style="padding: 40px 20px; max-width: 1200px; margin: 0 auto;">
                    <div class="card">
                        <div class="card-header">
                            <h2 class="card-title">
                                ${isAdmin ? 'Panel de Administración' : 'Mi Dashboard'}
                            </h2>
                        </div>
                        <div class="card-body">
                            ${isAdmin ? this.renderAdminPanel() : this.renderUserPanel()}
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    renderAdminPanel() {
        const totalUsers = this.users.length;
        const adminUsers = this.users.filter(u => u.role === 'admin').length;
        const regularUsers = this.users.filter(u => u.role === 'user').length;

        return `
            <div style="margin-bottom: 30px;">
                <h3 style="color: var(--dark-gray); margin-bottom: 20px;">Estadísticas del Sistema</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div style="background: var(--light-green); padding: 20px; border-radius: 8px; text-align: center;">
                        <h4 style="margin: 0; color: var(--dark-green);">Total Usuarios</h4>
                        <p style="font-size: 24px; font-weight: bold; margin: 10px 0; color: var(--dark-green);">${totalUsers}</p>
                    </div>
                    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; text-align: center;">
                        <h4 style="margin: 0; color: #1565c0;">Administradores</h4>
                        <p style="font-size: 24px; font-weight: bold; margin: 10px 0; color: #1565c0;">${adminUsers}</p>
                    </div>
                    <div style="background: #fff3e0; padding: 20px; border-radius: 8px; text-align: center;">
                        <h4 style="margin: 0; color: #ef6c00;">Usuarios Regulares</h4>
                        <p style="font-size: 24px; font-weight: bold; margin: 10px 0; color: #ef6c00;">${regularUsers}</p>
                    </div>
                </div>
            </div>
            
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="color: var(--dark-gray); margin: 0;">Gestión de Usuarios</h3>
                    <button class="btn btn-primary" onclick="municipalPortal.showAddUserForm()">
                        <i class="fas fa-plus"></i> Agregar Usuario
                    </button>
                </div>
                
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: var(--shadow);">
                        <thead style="background: var(--primary-green); color: white;">
                            <tr>
                                <th style="padding: 15px; text-align: left;">Nombre</th>
                                <th style="padding: 15px; text-align: left;">Identificación</th>
                                <th style="padding: 15px; text-align: left;">Email</th>
                                <th style="padding: 15px; text-align: left;">Rol</th>
                                <th style="padding: 15px; text-align: center;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.users.map(user => `
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 15px;">${user.name}</td>
                                    <td style="padding: 15px;">${user.identification}</td>
                                    <td style="padding: 15px;">${user.email}</td>
                                    <td style="padding: 15px;">
                                        <span style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; 
                                                     background: ${user.role === 'admin' ? 'var(--light-green)' : '#e3f2fd'}; 
                                                     color: ${user.role === 'admin' ? 'var(--dark-green)' : '#1565c0'};">
                                            ${user.role === 'admin' ? 'Administrador' : 'Usuario'}
                                        </span>
                                    </td>
                                    <td style="padding: 15px; text-align: center;">
                                        ${user.id !== this.currentUser.id ? `
                                            <button class="btn btn-secondary btn-sm" onclick="municipalPortal.editUser(${user.id})" style="margin-right: 5px;">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-danger btn-sm" onclick="municipalPortal.deleteUser(${user.id})">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        ` : '<span style="color: var(--medium-gray);">Usuario actual</span>'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderUserPanel() {
        return `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="background: var(--light-green); width: 80px; height: 80px; border-radius: 50%; 
                           display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <i class="fas fa-user" style="font-size: 32px; color: var(--dark-green);"></i>
                </div>
                <h3 style="color: var(--dark-gray); margin-bottom: 10px;">¡Bienvenido, ${this.currentUser.name}!</h3>
                <p style="color: var(--medium-gray); margin-bottom: 30px;">
                    Has iniciado sesión exitosamente en el Portal de Trámites Municipales.
                </p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 30px;">
                    <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: var(--shadow); text-align: center;">
                        <div style="background: var(--light-green); width: 60px; height: 60px; border-radius: 50%; 
                                   display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                            <i class="fas fa-file-alt" style="font-size: 24px; color: var(--dark-green);"></i>
                        </div>
                        <h4 style="color: var(--dark-gray); margin-bottom: 10px;">Mis Trámites</h4>
                        <p style="color: var(--medium-gray); font-size: 14px;">Consulta el estado de tus solicitudes</p>
                    </div>
                    
                    <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: var(--shadow); text-align: center;">
                        <div style="background: #e3f2fd; width: 60px; height: 60px; border-radius: 50%; 
                                   display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                            <i class="fas fa-plus-circle" style="font-size: 24px; color: #1565c0;"></i>
                        </div>
                        <h4 style="color: var(--dark-gray); margin-bottom: 10px;">Nuevo Trámite</h4>
                        <p style="color: var(--medium-gray); font-size: 14px;">Inicia una nueva solicitud</p>
                    </div>
                    
                    <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: var(--shadow); text-align: center;">
                        <div style="background: #fff3e0; width: 60px; height: 60px; border-radius: 50%; 
                                   display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                            <i class="fas fa-info-circle" style="font-size: 24px; color: #ef6c00;"></i>
                        </div>
                        <h4 style="color: var(--dark-gray); margin-bottom: 10px;">Información</h4>
                        <p style="color: var(--medium-gray); font-size: 14px;">Consulta información municipal</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Event Listeners
    attachEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    handleLogin() {
        const identification = document.getElementById('identification').value;
        const password = document.getElementById('password').value;
        const identificationType = document.getElementById('identificationType').value;

        if (!identification || !password) {
            this.showAlert('Por favor complete todos los campos.', 'error');
            return;
        }

        // Mostrar loading
        const submitBtn = document.querySelector('.btn-login-submit');
        const btnText = submitBtn.querySelector('.btn-text');
        const loading = submitBtn.querySelector('.loading');
        
        btnText.classList.add('hidden');
        loading.classList.remove('hidden');
        submitBtn.disabled = true;

        // Simular delay de autenticación
        setTimeout(() => {
            const success = this.login(identification, password, identificationType);
            
            // Restaurar botón
            btnText.classList.remove('hidden');
            loading.classList.add('hidden');
            submitBtn.disabled = false;
        }, 1000);
    }

    // Funciones auxiliares
    showAlert(message, type = 'info') {
        // Remover alertas existentes
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;

        const loginCard = document.querySelector('.login-card');
        if (loginCard) {
            loginCard.insertBefore(alert, loginCard.firstChild);
        }

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    showLoginForm() {
        // Ya está en la vista de login
        console.log('Mostrando formulario de login');
    }

    showRegisterForm() {
        this.showAlert('Funcionalidad de registro en desarrollo. Use las credenciales de prueba.', 'info');
    }

    showForgotPassword() {
        this.showAlert('Funcionalidad de recuperación de contraseña en desarrollo.', 'info');
    }

    showAddUserForm() {
        this.showAlert('Funcionalidad de agregar usuario en desarrollo.', 'info');
    }

    editUser(userId) {
        this.showAlert('Funcionalidad de editar usuario en desarrollo.', 'info');
    }

    deleteUser(userId) {
        if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
            this.users = this.users.filter(u => u.id !== userId);
            this.saveUsers();
            this.showAlert('Usuario eliminado exitosamente.', 'success');
            this.render();
        }
    }
}

// Inicializar la aplicación
const municipalPortal = new MunicipalPortal();

// Credenciales de prueba para desarrollo
console.log('=== CREDENCIALES DE PRUEBA ===');
console.log('Administrador:');
console.log('- Identificación: 12345678');
console.log('- Contraseña: admin123');
console.log('- Tipo: Cédula física');
console.log('');
console.log('Usuario Regular:');
console.log('- Identificación: 87654321');
console.log('- Contraseña: user123');
console.log('- Tipo: Cédula física');
console.log('===============================');