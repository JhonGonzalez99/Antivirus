// Sistema de usuarios (simulado en localStorage)
const USER_DB_KEY = 'antivirus_users';
const SESSION_KEY = 'antivirus_session';

// Inicializar base de datos de usuarios si no existe
if (!localStorage.getItem(USER_DB_KEY)) {
  localStorage.setItem(USER_DB_KEY, JSON.stringify([
    { 
      email: 'jgonzalezsanta@hotmail.com', 
      password: 'zajuna123',
      nombres: 'Juan',
      apellidos: 'González',
      celular: '1234567890'
    },
    { 
      email: 'admin@secureshield.com', 
      password: 'Admin123!',
      nombres: 'Admin',
      apellidos: 'SecureShield',
      celular: '0987654321'
    }
  ]));
}

// Configuración mejorada con almacenamiento local
const AUTH_CONFIG = {
  MAX_ATTEMPTS: 3,
  LOCK_TIME: 5 * 60 * 1000, // 5 minutos en milisegundos
  STORAGE_KEY: 'authState'
};

// Función para verificar sesión activa
function checkActiveSession() {
  const session = localStorage.getItem(SESSION_KEY);
  if (session && window.location.pathname.includes('index.html')) {
    window.location.href = 'interfaz.html';
  } else if (!session && window.location.pathname.includes('interfaz.html')) {
    window.location.href = 'index.html';
  }
}

// Verificar sesión al cargar
document.addEventListener('DOMContentLoaded', checkActiveSession);

// Módulo de autenticación
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('loginForm')) {
    // Elementos del DOM
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const passwordInput = document.getElementById('password');
    
    // Estado de autenticación (persistente)
    let authState = JSON.parse(localStorage.getItem(AUTH_CONFIG.STORAGE_KEY)) || {
      failedAttempts: 0,
      lockedUntil: null
    };
    
    // Verificar si la cuenta está bloqueada
    if (authState.lockedUntil && new Date() < new Date(authState.lockedUntil)) {
      lockAccount();
      const remainingTime = Math.ceil((new Date(authState.lockedUntil) - new Date()) / 60000);
      errorMessage.textContent = `Cuenta bloqueada. Intente nuevamente en ${remainingTime} minutos.`;
      errorMessage.style.display = 'block';
      
      setTimeout(() => {
        resetAccountLock();
      }, new Date(authState.lockedUntil) - new Date());
    }
    
    // Función para manejar intento fallido
    function handleFailedAttempt() {
      authState.failedAttempts++;
      errorMessage.textContent = `Credenciales incorrectas. Intentos restantes: ${AUTH_CONFIG.MAX_ATTEMPTS - authState.failedAttempts}`;
      errorMessage.style.display = 'block';
      
      if (authState.failedAttempts >= AUTH_CONFIG.MAX_ATTEMPTS) {
        lockAccount();
        const lockTime = new Date(Date.now() + AUTH_CONFIG.LOCK_TIME);
        authState.lockedUntil = lockTime.toISOString();
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, JSON.stringify(authState));
        
        const remainingTime = Math.ceil(AUTH_CONFIG.LOCK_TIME / 60000);
        errorMessage.textContent = `Cuenta bloqueada por seguridad. Intente nuevamente en ${remainingTime} minutos.`;
        
        setTimeout(() => {
          resetAccountLock();
        }, AUTH_CONFIG.LOCK_TIME);
      } else {
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, JSON.stringify(authState));
      }
    }
    
    function lockAccount() {
      disableLoginForm();
    }
    
    function resetAccountLock() {
      authState.failedAttempts = 0;
      authState.lockedUntil = null;
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, JSON.stringify(authState));
      enableLoginForm();
      errorMessage.style.display = 'none';
    }
    
    function disableLoginForm() {
      passwordInput.disabled = true;
      loginForm.querySelector('button[type="submit"]').disabled = true;
    }
    
    function enableLoginForm() {
      passwordInput.disabled = false;
      loginForm.querySelector('button[type="submit"]').disabled = false;
    }
    
    function handleSuccessfulLogin(user) {
      resetAccountLock();
      // Guardar sesión
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      
      Swal.fire({
        icon: 'success',
        title: '¡Ingreso exitoso!',
        text: 'Redirigiendo al panel de control...',
        timer: 2000,
        showConfirmButton: false,
        willClose: () => {
          window.location.href = 'interfaz.html';
        }
      });
    }
    
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      if (authState.lockedUntil && new Date() < new Date(authState.lockedUntil)) {
        return;
      }
      
      const email = document.getElementById('email').value.trim();
      const password = passwordInput.value;
      
      if (!isValidEmail(email)) {
        errorMessage.textContent = 'Por favor ingrese un email válido';
        errorMessage.style.display = 'block';
        return;
      }
      
      try {
        const user = await validateCredentials(email, password);
        if (user) {
          handleSuccessfulLogin(user);
        } else {
          handleFailedAttempt();
        }
      } catch (error) {
        console.error('Error de autenticación:', error);
        errorMessage.textContent = 'Error al conectar con el servidor. Intente nuevamente.';
        errorMessage.style.display = 'block';
      }
    });
    
    function isValidEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }
    
    function validateCredentials(email, password) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const users = JSON.parse(localStorage.getItem(USER_DB_KEY));
          const user = users.find(u => u.email === email && u.password === password);
          resolve(user || null);
        }, 800);
      });
    }
  }
});

// Módulo de registro
document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm');
  
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const nombres = document.getElementById('nombres').value.trim();
      const apellidos = document.getElementById('apellidos').value.trim();
      const email = document.getElementById('email').value.trim();
      const celular = document.getElementById('celular').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      const errors = [];
      
      if (!nombres || !apellidos) {
        errors.push('Nombre y apellido son obligatorios');
      }
      
      if (!isValidEmail(email)) {
        errors.push('Por favor ingrese un email válido');
      }
      
      if (!isValidPhone(celular)) {
        errors.push('Por favor ingrese un número de celular válido (10-15 dígitos)');
      }
      
      if (password.length < 8) {
        errors.push('La contraseña debe tener al menos 8 caracteres');
      } else if (!hasNumber(password) || !hasLetter(password)) {
        errors.push('La contraseña debe contener letras y números');
      }
      
      if (password !== confirmPassword) {
        errors.push('Las contraseñas no coinciden');
      }
      
      // Verificar si el email ya está registrado
      const users = JSON.parse(localStorage.getItem(USER_DB_KEY));
      if (users.some(user => user.email === email)) {
        errors.push('Este correo electrónico ya está registrado');
      }
      
      if (errors.length > 0) {
        Swal.fire({
          icon: 'error',
          title: 'Error en el formulario',
          html: errors.join('<br>')
        });
      } else {
        // Registrar nuevo usuario
        const newUser = {
          nombres,
          apellidos,
          email,
          celular,
          password
        };
        
        users.push(newUser);
        localStorage.setItem(USER_DB_KEY, JSON.stringify(users));
        
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          html: `Bienvenido ${nombres} ${apellidos}<br><br>
                Email: ${email}<br>
                Celular: ${celular}`,
          willClose: () => {
            window.location.href = 'index.html';
          }
        });
      }
    });
    
    function isValidEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }
    
    function isValidPhone(phone) {
      const re = /^[0-9]{10,15}$/;
      return re.test(phone);
    }
    
    function hasNumber(str) {
      return /\d/.test(str);
    }
    
    function hasLetter(str) {
      return /[a-zA-Z]/.test(str);
    }
  }
});

// Módulo de recuperación de contraseña
document.addEventListener('DOMContentLoaded', function() {
  const formRecuperacion = document.getElementById('formRecuperacion');
  
  if (formRecuperacion) {
    formRecuperacion.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value.trim();
      const confirmarEmail = document.getElementById('confirmarEmail').value.trim();
      const noRobot = document.getElementById('noRobot').checked;
      
      const errors = [];
      
      if (!isValidEmail(email)) {
        errors.push('Por favor ingrese un email válido');
      }
      
      if (email !== confirmarEmail) {
        errors.push('Los correos electrónicos no coinciden');
      }
      
      if (!noRobot) {
        errors.push('Por favor confirme que no es un robot');
      }
      
      // Verificar si el email existe
      const users = JSON.parse(localStorage.getItem(USER_DB_KEY));
      if (!users.some(user => user.email === email)) {
        errors.push('Este correo electrónico no está registrado');
      }
      
      if (errors.length > 0) {
        Swal.fire({
          icon: 'error',
          title: 'Error en el formulario',
          html: errors.join('<br>')
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Solicitud enviada',
          html: `Se ha enviado un enlace de recuperación a <strong>${email}</strong>`,
          timer: 3000,
          showConfirmButton: false,
          willClose: () => {
            window.location.href = 'index.html';
          }
        });
      }
    });
  }
});

// Cerrar sesión
function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = 'index.html';
}