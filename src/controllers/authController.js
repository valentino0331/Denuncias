const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { sendVerificationEmail } = require('../utils/emailService');


const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


exports.register = async (req, res) => {
    const {
    dni,
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    fechaNacimiento,
    telefono,
    email,
    password,
    direccion,
    distrito,
    } = req.body;

    try {

    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR dni = $2',
        [email, dni]
    );

    if (userExists.rows.length > 0) {
        return res.status(400).json({ 
        success: false, 
        message: 'El correo o DNI ya está registrado' 
        });
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = generateVerificationCode();//cod veri


    const result = await pool.query( //ussuarioo.
            `INSERT INTO users (
            dni, nombres, apellido_paterno, apellido_materno,
            fecha_nacimiento, telefono, email, password,
            direccion, distrito,
            verification_code, is_admin
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id, email, nombres`,
            [
            dni, nombres, apellidoPaterno, apellidoMaterno,
            fechaNacimiento, telefono, email, hashedPassword,
            direccion, distrito,
            verificationCode, false
            ]
        );
    const newUser = result.rows[0];


    await sendVerificationEmail(email, verificationCode, nombres);

    res.status(201).json({
        success: true,
        message: 'Usuario registrado. Revisa tu correo para verificar tu cuenta.',
        userId: newUser.id,
    });
    } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Error al registrar usuario' 
    });
    }
};


exports.verifyEmail = async (req, res) => {
    const { email, code } = req.body;

    try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND verification_code = $2',
        [email, code]
    );

    if (result.rows.length === 0) {
        return res.status(400).json({ 
        success: false, 
        message: 'Código de verificación incorrecto' 
        });
    }

    await pool.query(
        'UPDATE users SET email_verified = TRUE, verification_code = NULL WHERE email = $1',
        [email]
    );

    res.json({
        success: true,
        message: 'Email verificado exitosamente',
    });
    } catch (error) {
    console.error('Error en verificación:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Error al verificar email' 
    });
    }
};


exports.login = async (req, res) => {//--Log
    const { email, password } = req.body;

    console.log('Intento de login:', email);
    console.log('Password recibido:', password);

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        console.log('Usuario encontrado:', result.rows.length > 0);

        if (result.rows.length === 0) {
            console.log('Usuario no existe en la BD');
            return res.status(401).json({ 
                success: false, 
                message: 'Credenciales incorrectas' 
            });
        }

        const user = result.rows[0];

        console.log('Email verificado:', user.email_verified);
        console.log('Es admin:', user.is_admin);
        console.log('Hash en BD:', user.password);

        if (!user.email_verified) {
            console.log('Email no verificado');
            return res.status(403).json({ 
                success: false, 
                message: 'Por favor verifica tu correo electrónico primero' 
            });
        }

        console.log('Comparando contraseñas...');
        const isValidPassword = await bcrypt.compare(password, user.password);
        console.log('Contraseña válida:', isValidPassword);

        if (!isValidPassword) {
            console.log('Contraseña incorrecta');
            return res.status(401).json({ 
                success: false, 
                message: 'Credenciales incorrectas' 
            });
        }


        const token = jwt.sign(//tonk jwt
            { userId: user.id, isAdmin: user.is_admin },
            process.env.JWT_SECRET || 'tu_secreto_jwt',
            { expiresIn: '24h' }
        );

        console.log('Login exitoso para:', email);

        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                dni: user.dni,
                nombres: user.nombres,
                apellidoPaterno: user.apellido_paterno,
                apellidoMaterno: user.apellido_materno,
                email: user.email,
                telefono: user.telefono,
                direccion: user.direccion,
                distrito: user.distrito,
                isAdmin: user.is_admin,
            },
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al iniciar sesión' 
        });
    }
};
