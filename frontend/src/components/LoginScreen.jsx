import React, { useState } from 'react';
import { Shield, Mail } from 'lucide-react';
import { authAPI } from '../services/api';

const LoginScreen = ({ onLogin, setShowRegister, setShowVerification, setPendingEmail }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            if (isAdmin && loginData.email === 'admin@denuncias.com' && loginData.password === 'admin123') {
                // Login admin local (puedes cambiarlo para usar la BD)
                onLogin({
                    username: 'admin@denuncias.com',
                    isAdmin: true,
                    userData: null
                });
            } else {
                const response = await authAPI.login(loginData.email, loginData.password);

                // Guardar token
                localStorage.setItem('token', response.token);

                onLogin({
                    username: response.user.email,
                    isAdmin: response.user.isAdmin,
                    userData: response.user
                });
            }
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <Shield className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800">Denuncias Digitales</h1>
                    <p className="text-gray-600 mt-2">Sistema de Seguridad Ciudadana</p>
                </div>

                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setIsAdmin(false)}
                        className={`flex-1 py-3 rounded-lg transition-colors ${!isAdmin
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Usuario
                    </button>
                    <button
                        onClick={() => setIsAdmin(true)}
                        className={`flex-1 py-3 rounded-lg transition-colors ${isAdmin
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Admin
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isAdmin ? 'Usuario' : 'Correo Electrónico'}
                        </label>
                        <input
                            type={isAdmin ? 'text' : 'email'}
                            value={loginData.email}
                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder={isAdmin ? 'admin@denuncias.com' : 'correo@ejemplo.com'}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder={isAdmin ? 'admin123' : 'tu contraseña'}
                        />
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>

                    {!isAdmin && (
                        <button
                            onClick={() => setShowRegister(true)}
                            className="w-full py-3 bg-gray-100 text-indigo-600 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                        >
                            Crear Nueva Cuenta
                        </button>
                    )}
                </div>

                {isAdmin && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
                        <p className="font-semibold mb-1">Credenciales de prueba (Admin):</p>
                        <p>Usuario: <span className="font-mono">admin@denuncias.com</span></p>
                        <p>Contraseña: <span className="font-mono">admin123</span></p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginScreen;