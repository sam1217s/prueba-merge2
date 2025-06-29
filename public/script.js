
const API_URL = 'http://localhost:4000/api';

/**
 * Verificar autenticación
 */
function checkAuthentication() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Debes iniciar sesión para acceder al dashboard');
    window.location.href = 'index.html';
    return false;
  }
  return token;
}

/**
 * Mostrar/ocultar loading
 */
function toggleLoading(show = true) {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    if (show) {
      overlay.classList.add('show');
    } else {
      overlay.classList.remove('show');
    }
  }
}

/**
 * Formatear números con separadores de miles
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Obtener saludo según la hora
 */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

/**
 * Actualizar saludo en header
 */
function updateGreeting() {
  const greetingElement = document.querySelector('.greeting-text');
  if (greetingElement) {
    greetingElement.textContent = getGreeting();
  }
}

/**
 * Cargar datos del dashboard desde la API
 */
async function loadDashboardData() {
  try {
    toggleLoading(true);

    const token = checkAuthentication();
    if (!token) return;

    const response = await fetch(`${API_URL}/auth/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        window.location.href = 'index.html';
        return;
      }
      throw new Error('Error al cargar datos del dashboard');
    }

    const data = await response.json();
    populateDashboard(data);

  } catch (error) {
    console.error('Error loading dashboard:', error);
    showErrorState();
  } finally {
    toggleLoading(false);
  }
}

/**
 * Mostrar estado de error
 */
function showErrorState() {
  const content = document.querySelector('.dashboard-content');
  if (content) {
    content.innerHTML = `
      <div style="text-align: center; padding: 4rem; color: #64748b;">
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; color: #f59e0b;"></i>
        <h3>Error al cargar el dashboard</h3>
        <p>No se pudieron cargar los datos. Verifica tu conexión e inténtalo de nuevo.</p>
        <button onclick="loadDashboardData()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer;">
          Reintentar
        </button>
      </div>
    `;
  }
}

/**
 * Poblar dashboard con datos
 */
function populateDashboard(data) {
  updateUserInfo(data.user);
  updateStats(data);
  updateInvoices(data.recentInvoices);
  updateProjects(data.yourProjects);
  updateRecommendedProject(data.recommendedProject);
}

/**
 * Actualizar información del usuario
 */
function updateUserInfo(user) {
  const userAvatar = document.getElementById('userAvatar');
  const userName = document.getElementById('userName');
  const headerUserName = document.getElementById('headerUserName');

  if (userAvatar) {
    userAvatar.src = user.avatar;
    userAvatar.alt = `Avatar de ${user.name}`;
  }

  if (userName) {
    userName.textContent = user.name;
  }

  if (headerUserName) {
    headerUserName.textContent = user.name;
  }
}

/**
 * Actualizar estadísticas
 */
function updateStats(data) {
  const earningsAmount = document.getElementById('earningsAmount');
  const earningsChange = document.getElementById('earningsChange');

  if (earningsAmount) {
    animateNumber(earningsAmount, data.earnings.amount, 2000);
  }

  if (earningsChange) {
    earningsChange.textContent = data.earnings.change;
    earningsChange.className = `card-change ${data.earnings.trend === 'up' ? 'positive' : 'negative'}`;
  }

  const rankNumber = document.getElementById('rankNumber');
  const rankDescription = document.getElementById('rankDescription');

  if (rankNumber) {
    animateNumber(rankNumber, data.rank.position, 1500);
  }

  if (rankDescription) {
    rankDescription.textContent = data.rank.description;
  }

  const projectsNumber = document.getElementById('projectsNumber');
  const projectsPending = document.getElementById('projectsPending');
  const projectsCompleted = document.getElementById('projectsCompleted');

  if (projectsNumber) {
    animateNumber(projectsNumber, data.projects.total, 1000);
  }

  if (projectsPending) {
    projectsPending.textContent = data.projects.pending;
  }

  if (projectsCompleted) {
    projectsCompleted.textContent = data.projects.completed;
  }
}

/**
 * Animar números
 */
function animateNumber(element, targetValue, duration) {
  const startValue = 0;
  const startTime = performance.now();

  function animate(currentTime) {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);

    const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
    element.textContent = formatNumber(currentValue);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

/**
 * Actualizar facturas recientes
 */
function updateInvoices(invoices) {
  const container = document.getElementById('invoicesList');
  if (!container) return;

  container.innerHTML = invoices.map(invoice => `
    <div class="invoice-item">
      <img src="${invoice.avatar}" alt="${invoice.client}" class="invoice-avatar">
      <div class="invoice-info">
        <div class="invoice-client">${invoice.client}</div>
        <div class="invoice-company">${invoice.company}</div>
      </div>
      <div>
        <div class="invoice-amount">€ ${formatNumber(invoice.amount)}</div>
        <span class="invoice-status ${invoice.status.toLowerCase()}">${invoice.status}</span>
      </div>
    </div>
  `).join('');
}

/**
 * Actualizar proyectos
 */
function updateProjects(projects) {
  const container = document.getElementById('projectsList');
  if (!container) return;

  container.innerHTML = projects.map(project => `
    <div class="project-item">
      <img src="${project.avatar}" alt="${project.title}" class="project-avatar">
      <div class="project-info">
        <div class="project-title">${project.title}</div>
        <div class="project-days">${project.daysRemaining} días restantes</div>
      </div>
    </div>
  `).join('');
}

/**
 * Actualizar proyecto recomendado
 */
function updateRecommendedProject(project) {
  const container = document.getElementById('recommendedProject');
  if (!container) return;

  container.innerHTML = `
    <img src="${project.avatar}" alt="${project.client}" class="recommended-avatar">
    <div class="recommended-content">
      <div class="recommended-header">
        <div>
          <div class="recommended-client">${project.client}</div>
          <div class="recommended-company">${project.company}</div>
        </div>
        <span class="recommended-status">${project.status}</span>
      </div>
      <h4 class="recommended-title">${project.title}</h4>
      <p class="recommended-description">${project.description}</p>
      <div class="recommended-footer">
        <div class="recommended-budget">${formatNumber(project.budget)}</div>
        <span class="full-time-tag">Full time</span>
      </div>
    </div>
  `;
}

/**
 * Función de logout
 */
function logout() {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    localStorage.removeItem('token');
    alert('Sesión cerrada correctamente');
    window.location.href = 'index.html';
  }
}

/**
 * Simular datos cuando la API no está disponible
 */
function loadMockData() {
  const mockData = {
    user: {
      name: 'Filip Martin Jose',
      avatar: 'https://ui-avatars.com/api/?name=Filip+Martin+Jose&background=6366f1&color=fff&size=128'
    },
    earnings: {
      amount: 8350,
      change: '+10% desde el mes pasado',
      trend: 'up'
    },
    rank: {
      position: 98,
      description: 'en top 100'
    },
    projects: {
      total: 32,
      pending: 'mobile app',
      completed: 'branding'
    },
    recentInvoices: [
      {
        id: 1,
        client: 'Alexander Williams',
        company: 'AX creations',
        amount: 1200.87,
        status: 'Paid',
        avatar: 'https://ui-avatars.com/api/?name=Alexander+Williams&background=10b981&color=fff'
      },
      {
        id: 2,
        client: 'John Phillips',
        company: 'design studio',
        amount: 12989.88,
        status: 'Late',
        avatar: 'https://ui-avatars.com/api/?name=John+Phillips&background=ef4444&color=fff'
      }
    ],
    yourProjects: [
      {
        id: 1,
        title: 'Logo design for Bakery',
        daysRemaining: 3,
        avatar: 'https://ui-avatars.com/api/?name=Bakery&background=f59e0b&color=fff'
      },
      {
        id: 2,
        title: 'Personal branding project',
        daysRemaining: 5,
        avatar: 'https://ui-avatars.com/api/?name=Branding&background=8b5cf6&color=fff'
      }
    ],
    recommendedProject: {
      client: 'Thomas Martin',
      company: 'Upside Designs',
      title: 'Need a designer to form branding essentials for my business.',
      description: 'Looking for a talented brand designer to create all the branding materials for my new bakery.',
      budget: 8700,
      status: 'Design',
      avatar: 'https://ui-avatars.com/api/?name=Thomas+Martin&background=6366f1&color=fff'
    }
  };

  setTimeout(() => {
    populateDashboard(mockData);
    toggleLoading(false);
  }, 1500);
}

/**
 * Inicializar dashboard
 */
document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuthentication()) return;

  updateGreeting();

  loadDashboardData().catch(() => {
    console.log('API no disponible, cargando datos de prueba...');
    loadMockData();
  });

  setInterval(updateGreeting, 60000);
});
=======
const apiUrl = 'http://localhost:4000/api/auth';

/**
 * Función para mostrar alertas al usuario
 */
const showAlert = (message, isSuccess = false, redirectUrl = null) => {
  alert(message);
  if (isSuccess && redirectUrl) {
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 1500);
  }
};

/**

 * Mostrar estado de validación en tiempo real
 */
function showFieldStatus(fieldId, message, type) {
  const statusElement = document.getElementById(fieldId);
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = `field-status ${type}`;
    statusElement.style.display = message ? 'block' : 'none';
  }
}

/**
 * Validar formato del username
 */
function validateUsername(username) {
  if (!username || username.trim() === '') {
    return { valid: false, message: 'El nombre de usuario es requerido' };
  }
  
  if (username.length < 3) {
    return { valid: false, message: 'Mínimo 3 caracteres' };
  }
  
  if (username.length > 20) {
    return { valid: false, message: 'Máximo 20 caracteres' };
  }
  
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { valid: false, message: 'Solo letras, números y guiones bajos' };
  }
  
  return { valid: true, message: '✓ Username válido' };
}

/**
 * Validar formato del email
 */
function validateEmail(email) {
  if (!email || email.trim() === '') {
    return { valid: true, message: '' }; // Email es opcional
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Formato de email inválido' };
  }
  
  return { valid: true, message: '✓ Email válido' };
}

/**
 * Calcular fortaleza de contraseña
 */
function calculatePasswordStrength(password) {
  let score = 0;
  let feedback = [];
  
  if (password.length >= 6) score += 20;
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;
  
  // Determinar nivel y color
  let level, color, text;
  if (score < 30) {
    level = 'weak';
    color = '#ff4757';
    text = 'Muy débil';
  } else if (score < 60) {
    level = 'medium';
    color = '#ffa726';
    text = 'Débil';
  } else if (score < 80) {
    level = 'good';
    color = '#66bb6a';
    text = 'Buena';
  } else {
    level = 'strong';
    color = '#4caf50';
    text = 'Muy fuerte';
  }
  
  return { score, level, color, text };
}

/**
 * Validar contraseña y actualizar indicador visual
 */
function validatePassword(password) {
  if (!password || password.trim() === '') {
    return { valid: false, message: 'La contraseña es requerida' };
  }
  
  if (password.length < 6) {
    return { valid: false, message: 'Mínimo 6 caracteres' };
  }
  
  if (password.length > 50) {
    return { valid: false, message: 'Máximo 50 caracteres' };
  }
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { 
      valid: false, 
      message: 'Debe contener letras y números' 
    };
  }
  
  const strength = calculatePasswordStrength(password);
  updatePasswordStrengthIndicator(strength);
  
  return { valid: true, message: '✓ Contraseña válida' };
}

/**
 * Actualizar indicador visual de fortaleza
 */
function updatePasswordStrengthIndicator(strength) {
  const strengthBar = document.getElementById('strengthBar');
  const strengthText = document.getElementById('strengthText');
  
  if (strengthBar && strengthText) {
    strengthBar.style.width = `${strength.score}%`;
    strengthBar.style.backgroundColor = strength.color;
    strengthText.textContent = strength.text;
    strengthText.style.color = strength.color;
  }
}

/**
 * Validar confirmación de contraseña
 */
function validatePasswordConfirmation(password, confirmation) {
  if (!confirmation || confirmation.trim() === '') {
    return { valid: false, message: 'Confirma tu contraseña' };
  }
  
  if (password !== confirmation) {
    return { valid: false, message: 'Las contraseñas no coinciden' };
  }
  
  return { valid: true, message: '✓ Contraseñas coinciden' };
}

/**
 * Validar todos los campos del formulario
 */
function validateAllFields(username, email, password, confirmPassword) {
  const usernameValidation = validateUsername(username);
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);
  const confirmValidation = validatePasswordConfirmation(password, confirmPassword);
  
  // Mostrar estados en tiempo real
  showFieldStatus('usernameStatus', usernameValidation.message, 
    usernameValidation.valid ? 'success' : 'error');
  showFieldStatus('emailStatus', emailValidation.message, 
    emailValidation.valid ? 'success' : 'error');
  showFieldStatus('passwordStatus', passwordValidation.message, 
    passwordValidation.valid ? 'success' : 'error');
  showFieldStatus('confirmPasswordStatus', confirmValidation.message, 
    confirmValidation.valid ? 'success' : 'error');
  
  // Verificar términos y condiciones
  const termsAccepted = document.getElementById('termsAccepted').checked;
  if (!termsAccepted) {
    showAlert('Debes aceptar los términos y condiciones');
    return false;
  }
  
  return usernameValidation.valid && emailValidation.valid && 
         passwordValidation.valid && confirmValidation.valid;
}

/**
 * Manejar el proceso de registro
 */
async function handleRegister(username, password, email = null) {
  try {
    // Deshabilitar botón durante el proceso
    const registerButton = document.getElementById('registerButton');
    registerButton.disabled = true;
    registerButton.textContent = 'Registrando...';
    
    // Preparar datos para enviar
    const userData = { 
      username: username.trim(), 
      password: password.trim() 
    };
    
    if (email && email.trim()) {
      userData.email = email.trim();
    }
    
    // Llamar a la API
    const response = await fetch(`${apiUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)

 * Validar campos del formulario de login
 */
function validateLoginFields(username, password) {
  if (!username || username.trim() === '') {
    showAlert('El nombre de usuario es requerido');
    return false;
  }
  
  if (!password || password.trim() === '') {
    showAlert('La contraseña es requerida');
    return false;
  }
  
  if (username.length < 3) {
    showAlert('El nombre de usuario debe tener al menos 3 caracteres');
    return false;
  }
  
  return true;
}

/**
 * Manejar el proceso de login
 */
async function handleLogin(username, password) {
  try {
    // Deshabilitar botón durante el proceso
    const loginButton = document.getElementById('loginButton');
    loginButton.disabled = true;
    loginButton.textContent = 'Iniciando sesión...';
    
    const response = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })

    });

    const data = await response.json();


    if (response.ok) {
      // Mostrar mensaje de éxito
      showAlert(
        `¡Usuario ${data.user.username} registrado exitosamente!`, 
        true
      );
      
      // Limpiar formulario
      document.getElementById('registerForm').reset();
      
      // Limpiar indicadores visuales
      ['usernameStatus', 'emailStatus', 'passwordStatus', 'confirmPasswordStatus'].forEach(id => {
        showFieldStatus(id, '', '');
      });
      
      // Reiniciar indicador de fortaleza
      updatePasswordStrengthIndicator({ score: 0, color: '#ddd', text: 'Fortaleza de contraseña' });
      
      // Redirigir al login después de un delay
      setTimeout(() => {
        showAlert('Redirigiendo al login...', true, 'index.html');
      }, 2000);
      
    } else {
      showAlert(data.error || data.msg || 'Error al registrar usuario');

    if (response.ok && data.token) {
      // Guardar token en localStorage
      localStorage.setItem('token', data.token);
      showAlert(`¡Bienvenido ${data.user.username}! Login exitoso.`, true, 'dashboard.html');
    } else {
      showAlert(data.error || data.msg || 'Credenciales inválidas');

    }
  } catch (error) {
    showAlert('No se pudo conectar con el servidor');
    console.error('Error:', error);
  } finally {
    // Rehabilitar botón

    const registerButton = document.getElementById('registerButton');
    registerButton.disabled = false;
    registerButton.textContent = 'Crear Cuenta';

    const loginButton = document.getElementById('loginButton');
    loginButton.disabled = false;
    loginButton.textContent = 'Iniciar Sesión';

  }
}

/**
 * Configurar event listeners cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');


  // ✅ REGISTRO IMPLEMENTADO - Desarrollador 2
  if (registerForm) {
    // Manejar envío del formulario
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('usuario').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('contrasena').value.trim();
      const confirmPassword = document.getElementById('confirmarContrasena').value.trim();
      
      if (validateAllFields(username, email, password, confirmPassword)) {
        await handleRegister(username, password, email);
      }
    });
    
    // Validación en tiempo real del username
    const usernameInput = document.getElementById('usuario');
    if (usernameInput) {
      let timeoutId;
      usernameInput.addEventListener('input', () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const validation = validateUsername(usernameInput.value.trim());
          showFieldStatus('usernameStatus', validation.message, 
            validation.valid ? 'success' : 'error');
        }, 300);
      });
    }
    
    // Validación en tiempo real del email
    const emailInput = document.getElementById('email');
    if (emailInput) {
      let timeoutId;
      emailInput.addEventListener('input', () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const validation = validateEmail(emailInput.value.trim());
          showFieldStatus('emailStatus', validation.message, 
            validation.valid ? 'success' : 'error');
        }, 300);
      });
    }
    
    // Validación en tiempo real del password
    const passwordInput = document.getElementById('contrasena');
    if (passwordInput) {
      passwordInput.addEventListener('input', () => {
        const validation = validatePassword(passwordInput.value);
        showFieldStatus('passwordStatus', validation.message, 
          validation.valid ? 'success' : 'error');
      });
    }
    
    // Validación de confirmación de contraseña
    const confirmPasswordInput = document.getElementById('confirmarContrasena');
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener('input', () => {
        const password = document.getElementById('contrasena').value;
        const validation = validatePasswordConfirmation(password, confirmPasswordInput.value);
        showFieldStatus('confirmPasswordStatus', validation.message, 
          validation.valid ? 'success' : 'error');
      });
    }
  }

});

  // ❌ REGISTRO NO IMPLEMENTADO - Desarrollador 2 debe implementar
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      showAlert('Función de registro no implementada. Desarrollador 2 debe completar esta funcionalidad.');
    });
  }

  // ✅ LOGIN IMPLEMENTADO - Desarrollador 1
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = loginForm.username.value.trim();
      const password = loginForm.password.value.trim();

      if (validateLoginFields(username, password)) {
        await handleLogin(username, password);
      }
    });
    
    // Agregar efectos visuales a los inputs
    const inputs = loginForm.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.style.borderColor = '#6D3C52';
        input.style.transform = 'translateY(-2px)';
      });
      
      input.addEventListener('blur', () => {
        input.style.borderColor = '#ddd';
        input.style.transform = 'translateY(0)';
      });
    });
  }

  // Verificar si ya está autenticado
  const token = localStorage.getItem('token');
  if (token && loginForm) {
    showAlert('Ya tienes una sesión activa', true, 'dashboard.html');
  }
});

/**
 * Función para cerrar sesión (para dashboard)
 */
function logout() {
  localStorage.removeItem('token');
  showAlert('Sesión cerrada correctamente', true, 'index.html');
}
  document.getElementById('btnRegister').addEventListener('click', () => {
    window.location.href = 'register.html';
  });


