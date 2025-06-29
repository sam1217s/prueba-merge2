const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// ❌ NO TOCAR - Responsabilidad del Desarrollador 2
exports.register = async (req, res) => {
  try {
    res.status(501).json({ 
      msg: 'Register function not implemented yet',
      developer: 'Desarrollador 2 debe implementar esta función' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ NO TOCAR - Responsabilidad del Desarrollador 1
exports.login = async (req, res) => {
  try {
    res.status(501).json({ 
      msg: 'Login function not implemented yet',
      developer: 'Desarrollador 1 debe implementar esta función' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ IMPLEMENTADO - Responsabilidad del Desarrollador 3
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Obtener datos del usuario
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    
    // Simular datos del dashboard
    const dashboardData = {
      user: {
        name: user.username,
        avatar: `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff`
      },
      earnings: {
        amount: 8350,
        change: '+10% since last month',
        trend: 'up'
      },
      rank: {
        position: 98,
        description: 'in top 100'
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
    
    res.json(dashboardData);
  } catch (err) {
    console.error('Dashboard data error:', err);
    res.status(500).json({ error: 'Error loading dashboard data' });
  }
};


// ✅ IMPLEMENTADO - Responsabilidad del Desarrollador 2
exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // Validar campos requeridos

// ✅ IMPLEMENTADO - Responsabilidad del Desarrollador 1
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validar que los campos existan

    if (!username || !password) {
      return res.status(400).json({ msg: 'Username and password are required' });
    }
    

    // Validar longitud del username
    if (username.length < 3) {
      return res.status(400).json({ msg: 'Username must be at least 3 characters long' });
    }
    
    if (username.length > 20) {
      return res.status(400).json({ msg: 'Username cannot exceed 20 characters' });
    }
    
    // Validar caracteres del username
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ msg: 'Username can only contain letters, numbers and underscores' });
    }
    
    // Validar longitud del password
    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
    }
    
    if (password.length > 50) {
      return res.status(400).json({ msg: 'Password cannot exceed 50 characters' });
    }
    
    // Validar fortaleza del password
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasLetter || !hasNumber) {
      return res.status(400).json({ 
        msg: 'Password must contain at least one letter and one number' 
      });
    }
    
    // Validar email si se proporciona
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ msg: 'Please provide a valid email address' });
      }
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ 
      $or: [
        { username: username.toLowerCase() },
        ...(email ? [{ email: email.toLowerCase() }] : [])
      ]
    });
    
    if (existingUser) {
      if (existingUser.username === username.toLowerCase()) {
        return res.status(400).json({ msg: 'Username already exists' });
      }
      if (existingUser.email === email?.toLowerCase()) {
        return res.status(400).json({ msg: 'Email already registered' });
      }
    }
    
    // Hash de la contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Crear nuevo usuario
    const newUser = new User({
      username: username.toLowerCase(),
      password: hashedPassword,
      email: email ? email.toLowerCase() : null,
      createdAt: new Date(),
      isActive: true
    });
    
    // Guardar en la base de datos
    await newUser.save();
    
    // Respuesta exitosa (sin incluir la contraseña)
    res.status(201).json({ 
      msg: 'User registered successfully',
      user: { 
        id: newUser._id, 
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    
    // Manejar errores específicos de MongoDB
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ 
        msg: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
      });
    }
    
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};


    // Buscar el usuario en la base de datos
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { id: user._id, username: user.username }, 
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Retornar token y datos del usuario
    res.json({ 
      token, 
      user: { id: user._id, username: user.username }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


