import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { authAPI } from '../services/api';

const RegisterScreen = ({ setShowRegister, setShowVerification, setPendingEmail }) => {
    const [formData, setFormData] = useState({
        dni: '',
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        fechaNacimiento: '',
        telefono: '',
        email: '',
        password: '',
        confirmPassword: '',
        direccion: '',
        distrito: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            const userData = { ...formData };
            delete userData.confirmPassword;

            await authAPI.register(userData);

            setSuccess('Registro exitoso. Revisa tu correo para el código de verificación.');
            setPendingEmail(formData.email);

            setTimeout(() => {
                setShowVerification(true);
                setShowRegister(false);
            }, 3000);

        } catch (err) {
            setError(err.message || 'Error en el registro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
            <div className="text-center mb-6">
                <UserPlus className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                <h1 className="text-3xl font-bold text-gray-800">Crear Nueva Cuenta</h1>
                <p className="text-gray-600 mt-1">Ingresa tus datos para registrarte.</p>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField name="dni" label="DNI" value={formData.dni} onChange={handleChange} required maxLength="8" type="tel" />
                    <InputField name="nombres" label="Nombres" value={formData.nombres} onChange={handleChange} required />
                    <InputField name="apellidoPaterno" label="Apellido Paterno" value={formData.apellidoPaterno} onChange={handleChange} required />
                    <InputField name="apellidoMaterno" label="Apellido Materno" value={formData.apellidoMaterno} onChange={handleChange} required />
                    <InputField name="fechaNacimiento" label="Fecha de Nacimiento" type="date" value={formData.fechaNacimiento} onChange={handleChange} required />
                    <InputField name="telefono" label="Teléfono" value={formData.telefono} onChange={handleChange} required maxLength="9" type="tel" />
                    <InputField name="email" label="Correo Electrónico" type="email" value={formData.email} onChange={handleChange} required />
                    <InputField name="password" label="Contraseña" type="password" value={formData.password} onChange={handleChange} required />
                    <InputField name="confirmPassword" label="Confirmar Contraseña" type="password" value={formData.confirmPassword} onChange={handleChange} required />
                    <InputField name="direccion" label="Dirección" value={formData.direccion} onChange={handleChange} required />
                    <InputField name="distrito" label="Distrito" value={formData.distrito} onChange={handleChange} required />
                </div>

                <div className="flex flex-col md:flex-row gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => setShowRegister(false)}
                        className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                    >
                        Volver a Inicio de Sesión
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50"
                    >
                        {loading ? 'Registrando...' : 'Registrarme'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const InputField = ({ label, required, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            {...props}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
    </div>
);

export default RegisterScreen;
