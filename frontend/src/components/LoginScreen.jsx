import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { authAPI } from '../services/api';
import RegisterScreen from './RegisterScreen';
import VerificationScreen from './VerificationScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';

const LoginScreen = ({
    onLogin,
    showRegister,
    setShowRegister,
    showVerification,
    setShowVerification,
    pendingEmail,
    setPendingEmail
}) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const handleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            localStorage.removeItem('token');
            const response = await authAPI.login(loginData.email, loginData.password);
            localStorage.setItem('token', response.token);

            onLogin({
                username: response.user.email,
                isAdmin: response.user.isAdmin,
                userData: response.user
            });
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-black flex items-center justify-center p-4">
            {showVerification ? (
                <VerificationScreen
                    pendingEmail={pendingEmail}
                    setShowVerification={setShowVerification}
                />
            ) : showRegister ? (
                <RegisterScreen
                    setShowRegister={setShowRegister}
                    setShowVerification={setShowVerification}
                    setPendingEmail={setPendingEmail}
                />
            ) : showForgotPassword ? (
                <ForgotPasswordScreen setShowForgotPassword={setShowForgotPassword} />
            ) : (
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                    <div className="text-center mb-8">
                        <Shield className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-gray-800">RiskMap</h1>
                        <p className="text-gray-600 mt-2">Sistema de Denuncias Ciudadanas con Mapa de Riesgo</p>
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
                                placeholder={isAdmin ? 'ejemplo@denuncias.com' : 'correo@ejemplo.com'}
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
                                placeholder={isAdmin ? 'Contraseña' : 'Contraseña'}
                            />
                            <div className="flex justify-end mt-1">
                                <button
                                    onClick={() => setShowForgotPassword(true)}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
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
                </div>
            )}
        </div>
    );
};

export default LoginScreen;