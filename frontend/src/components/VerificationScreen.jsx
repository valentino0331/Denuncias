import React, { useState } from 'react';
import { MailCheck } from 'lucide-react';
import { authAPI } from '../services/api';

const VerificationScreen = ({ pendingEmail, setShowVerification, onLogin }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await authAPI.verifyEmail(pendingEmail, code);
            setSuccess('¡Correo verificado con éxito! Ahora puedes iniciar sesión.');
            setTimeout(() => {
                setShowVerification(false);
            }, 3000);
        } catch (err) {
            setError(err.message || 'Error al verificar el código.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center mb-6">
                <MailCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h1 className="text-3xl font-bold text-gray-800">Verifica tu Correo</h1>
                <p className="text-gray-600 mt-1">
                    Hemos enviado un código de 6 dígitos a <span className="font-bold">{pendingEmail}</span>.
                </p>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código de Verificación
                    </label>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center tracking-[0.5em] focus:ring-2 focus:ring-indigo-500"
                        maxLength="6"
                        placeholder="______"
                        required
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50"
                    >
                        {loading ? 'Verificando...' : 'Verificar Cuenta'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VerificationScreen;
