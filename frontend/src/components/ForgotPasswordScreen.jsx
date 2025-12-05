import React, { useState } from 'react';
import { Shield, ArrowLeft, Mail, Lock, Key } from 'lucide-react';
import { authAPI } from '../services/api';

const ForgotPasswordScreen = ({ setShowForgotPassword }) => {
    const [step, setStep] = useState(1); // 1: Email, 2: Reset
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSendCode = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authAPI.forgotPassword(email);
            setMessage('Código enviado a tu correo');
            setStep(2);
        } catch (err) {
            setError(err.message || 'Error al enviar código');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authAPI.resetPassword(email, code, newPassword);
            alert('Contraseña restablecida exitosamente');
            setShowForgotPassword(false);
        } catch (err) {
            setError(err.message || 'Error al restablecer contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <button
                onClick={() => setShowForgotPassword(false)}
                className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver al Login
            </button>

            <div className="text-center mb-8">
                <Shield className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Recuperar Contraseña</h2>
                <p className="text-gray-600 mt-2">
                    {step === 1 ? 'Ingresa tu correo para recibir un código' : 'Ingresa el código y tu nueva contraseña'}
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {message && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                    {message}
                </div>
            )}

            {step === 1 ? (
                <form onSubmit={handleSendCode} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correo Electrónico
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="correo@ejemplo.com"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Enviando...' : 'Enviar Código'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Código de Verificación
                        </label>
                        <div className="relative">
                            <Key className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                required
                                maxLength="6"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent tracking-widest text-center font-bold"
                                placeholder="000000"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nueva Contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input
                                type="password"
                                required
                                minLength="6"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default ForgotPasswordScreen;
