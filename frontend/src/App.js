import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, Shield, LogOut, Plus, Filter, Clock, TrendingUp, Mail, User, Phone, MapPinned } from 'lucide-react';
import { authAPI, reportsAPI } from './services/api';

const App = () => {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [showRegister, setShowRegister] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [isAddingReport, setIsAddingReport] = useState(false);
  const [newReport, setNewReport] = useState({
    type: 'robo',
    description: '',
    points: [],
    exactLocation: null,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    testigos: '',
    detallesAdicionales: '',
    objetosRobados: '',
    montoAproximado: ''
  });
  const [filter, setFilter] = useState('all');
  const [mapClickMode, setMapClickMode] = useState(null);

  // Cargar reportes cuando el usuario hace login
  useEffect(() => {
    if (user && !user.isAdmin) {
      loadUserReports();
    } else if (user && user.isAdmin) {
      loadAllReports();
    }
  }, [user]);

  const loadUserReports = async () => {
    try {
      const response = await reportsAPI.getMyReports();
      setReports(response.reports);
    } catch (error) {
      console.error('Error cargando reportes:', error);
    }
  };

const loadAllReports = async () => {
  try {
    console.log('🔍 Cargando reportes del admin...');
    const response = await reportsAPI.getAllReports();
    console.log('Reportes cargados:', response.reports);
    setReports(response.reports);
  } catch (error) {
    console.error('Error cargando reportes:', error);
    alert('Error al cargar reportes: ' + error.message);
  }
};

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setReports([]);
  };

  const handleMapClick = (e) => {
    if (!mapClickMode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (mapClickMode === 'points' && newReport.points.length < 3) {
      setNewReport(prev => ({
        ...prev,
        points: [...prev.points, { x, y, id: Date.now() }]
      }));
      if (newReport.points.length === 2) {
        setMapClickMode(null);
      }
    } else if (mapClickMode === 'exact') {
      setNewReport(prev => ({
        ...prev,
        exactLocation: { x, y }
      }));
      setMapClickMode(null);
    }
  };

  const submitReport = async () => {
    if (newReport.points.length === 0 || !newReport.description) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      await reportsAPI.create(newReport);

      setNewReport({
        type: 'robo',
        description: '',
        points: [],
        exactLocation: null,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        testigos: '',
        detallesAdicionales: '',
        objetosRobados: '',
        montoAproximado: ''
      });
      setIsAddingReport(false);
      alert('Reporte enviado exitosamente');
      loadUserReports();
    } catch (error) {
      alert('Error al enviar reporte: ' + error.message);
    }
  };

  const calculateRiskZones = () => {
    const gridSize = 10;
    const heatmap = {};

    reports.forEach(report => {
      const points = typeof report.points === 'string' ? JSON.parse(report.points) : report.points;
      points.forEach(point => {
        const gridX = Math.floor(point.x / gridSize);
        const gridY = Math.floor(point.y / gridSize);
        const key = `${gridX},${gridY}`;
        heatmap[key] = (heatmap[key] || 0) + 1;
      });
    });

    return Object.entries(heatmap).map(([key, count]) => {
      const [gridX, gridY] = key.split(',').map(Number);
      return {
        x: gridX * gridSize,
        y: gridY * gridSize,
        intensity: count,
        size: gridSize
      };
    });
  };

  const getTypeColor = (type) => {
    const colors = {
      robo: '#ef4444',
      asalto: '#f97316',
      acoso: '#8b5cf6',
      vandalismo: '#eab308'
    };
    return colors[type] || '#6b7280';
  };

  const filteredReports = filter === 'all'
    ? reports
    : reports.filter(r => r.type === filter);

  const stats = {
    total: reports.length,
    thisWeek: reports.filter(r => {
      const reportDate = new Date(r.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return reportDate > weekAgo;
    }).length,
    byType: reports.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {})
  };

  if (!user) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onShowRegister={() => setShowRegister(true)}
        showRegister={showRegister}
        setShowRegister={setShowRegister}
        showVerification={showVerification}
        setShowVerification={setShowVerification}
        pendingEmail={pendingEmail}
        setPendingEmail={setPendingEmail}
      />
    );
  }

  if (user.isAdmin) {
    return (
      <AdminDashboard
        reports={filteredReports}
        allReports={reports}
        filter={filter}
        setFilter={setFilter}
        stats={stats}
        calculateRiskZones={calculateRiskZones}
        getTypeColor={getTypeColor}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Denuncias Digitales</h1>
                <p className="text-sm text-gray-600">
                  {user.userData.nombres} {user.userData.apellidoPaterno} - DNI: {user.userData.dni}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </header>

        {!isAddingReport ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Mis Reportes</h2>
              <button
                onClick={() => setIsAddingReport(true)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5" />
                Nueva Denuncia
              </button>
            </div>

            <div className="space-y-4">
              {reports.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No tienes denuncias registradas</p>
              ) : (
                reports.map(report => (
                  <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" style={{ color: getTypeColor(report.type) }} />
                        <span className="font-semibold capitalize">{report.type}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(report.created_at).toLocaleDateString()} - {report.time}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{report.description}</p>
                    {report.objetos_robados && (
                      <p className="text-sm text-gray-600">Objetos: {report.objetos_robados}</p>
                    )}
                    {report.monto_aproximado && (
                      <p className="text-sm text-gray-600">Monto aprox: S/ {report.monto_aproximado}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Nueva Denuncia Ciudadana</h2>

            <div className="space-y-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Información del Denunciante
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Nombres Completos:</p>
                    <p className="font-medium">{user.userData.nombres} {user.userData.apellidoPaterno} {user.userData.apellidoMaterno}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">DNI:</p>
                    <p className="font-medium">{user.userData.dni}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Teléfono:</p>
                    <p className="font-medium">{user.userData.telefono}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Correo:</p>
                    <p className="font-medium">{user.userData.email}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Detalles del Incidente
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Incidente <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newReport.type}
                      onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="robo">Robo</option>
                      <option value="asalto">Asalto</option>
                      <option value="acoso">Acoso</option>
                      <option value="vandalismo">Vandalismo</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha del Incidente <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={newReport.date}
                        onChange={(e) => setNewReport({ ...newReport, date: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora Aproximada <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={newReport.time}
                        onChange={(e) => setNewReport({ ...newReport, time: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción Detallada del Incidente <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={newReport.description}
                      onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows="4"
                      placeholder="Describa con detalle lo sucedido: cómo ocurrió, características de los responsables, vehículos involucrados, etc."
                    />
                  </div>

                  {newReport.type === 'robo' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Objetos Robados
                        </label>
                        <input
                          type="text"
                          value={newReport.objetosRobados}
                          onChange={(e) => setNewReport({ ...newReport, objetosRobados: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="Ej: Celular Samsung, billetera, documentos"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Monto Aproximado (S/)
                        </label>
                        <input
                          type="number"
                          value={newReport.montoAproximado}
                          onChange={(e) => setNewReport({ ...newReport, montoAproximado: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="Valor aproximado de lo robado"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Testigos (Nombres y contactos)
                    </label>
                    <textarea
                      value={newReport.testigos}
                      onChange={(e) => setNewReport({ ...newReport, testigos: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows="2"
                      placeholder="Nombres completos y teléfonos de testigos si los hay"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Detalles Adicionales
                    </label>
                    <textarea
                      value={newReport.detallesAdicionales}
                      onChange={(e) => setNewReport({ ...newReport, detallesAdicionales: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows="2"
                      placeholder="Cualquier información adicional relevante"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MapPinned className="w-5 h-5 text-green-600" />
                  Ubicación del Incidente <span className="text-red-500">*</span>
                </h3>

                <div className="space-y-3 mb-4">
                  <button
                    onClick={() => setMapClickMode('points')}
                    disabled={newReport.points.length >= 3}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${mapClickMode === 'points'
                      ? 'bg-indigo-100 border-indigo-600'
                      : 'border-gray-300 hover:border-indigo-400'
                      } ${newReport.points.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Marcar Área de Riesgo ({newReport.points.length}/3 puntos) - Radio ~50m
                  </button>
                  <button
                    onClick={() => setMapClickMode('exact')}
                    disabled={!!newReport.exactLocation}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${mapClickMode === 'exact'
                      ? 'bg-green-100 border-green-600'
                      : 'border-gray-300 hover:border-green-400'
                      } ${newReport.exactLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {newReport.exactLocation ? 'Ubicación Exacta Marcada ✓' : 'Marcar Ubicación Exacta (Opcional)'}
                  </button>
                </div>

                <div
                  onClick={handleMapClick}
                  className="relative w-full h-96 bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden cursor-crosshair"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #ddd 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                >
                  {newReport.points.map((point, idx) => (
                    <div
                      key={point.id}
                      className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg transform -translate-x-2 -translate-y-2 flex items-center justify-center text-white text-xs font-bold"
                      style={{ left: `${point.x}%`, top: `${point.y}%` }}
                    >
                      {idx + 1}
                    </div>
                  ))}

                  {newReport.exactLocation && (
                    <div
                      className="absolute transform -translate-x-3 -translate-y-6"
                      style={{
                        left: `${newReport.exactLocation.x}%`,
                        top: `${newReport.exactLocation.y}%`
                      }}
                    >
                      <MapPin className="w-6 h-6 text-green-600" fill="currentColor" />
                    </div>
                  )}

                  <div className="absolute top-4 left-4 bg-white/90 px-3 py-2 rounded-lg text-sm">
                    {mapClickMode === 'points' && 'Haz clic para marcar puntos del área (hasta 3)'}
                    {mapClickMode === 'exact' && 'Haz clic para marcar ubicación exacta del incidente'}
                    {!mapClickMode && 'Selecciona una opción arriba para marcar en el mapa'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setIsAddingReport(false);
                  setNewReport({
                    type: 'robo',
                    description: '',
                    points: [],
                    exactLocation: null,
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
                    testigos: '',
                    detallesAdicionales: '',
                    objetosRobados: '',
                    montoAproximado: ''
                  });
                }}
                className="flex-1 px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={submitReport}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Enviar Denuncia
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente LoginScreen
const LoginScreen = ({ onLogin, onShowRegister, showRegister, setShowRegister, showVerification, setShowVerification, pendingEmail, setPendingEmail }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registerData, setRegisterData] = useState({
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
    nombrePadre: '',
    nombreMadre: ''
  });
  const [verificationCode, setVerificationCode] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      // SIEMPRE usar la API para login (incluyendo admin)
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

  const handleRegisterSubmit = async () => {
    if (!registerData.dni || registerData.dni.length !== 8) {
      alert('El DNI debe tener 8 dígitos');
      return;
    }
    if (!registerData.nombres || !registerData.apellidoPaterno || !registerData.apellidoMaterno) {
      alert('Todos los nombres son obligatorios');
      return;
    }
    if (!registerData.email.includes('@')) {
      alert('Correo electrónico inválido');
      return;
    }
    if (registerData.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (!registerData.telefono || registerData.telefono.length !== 9) {
      alert('El teléfono debe tener 9 dígitos');
      return;
    }

    try {
      await authAPI.register(registerData);
      setPendingEmail(registerData.email);
      setShowVerification(true);
      setShowRegister(false);
      alert('Registro exitoso. Revisa tu correo para el código de verificación.');
    } catch (error) {
      alert('Error en registro: ' + error.message);
    }
  };

  const handleVerification = async () => {
    try {
      await authAPI.verifyEmail(pendingEmail, verificationCode);
      alert('¡Correo verificado exitosamente! Ya puedes iniciar sesión.');
      setShowVerification(false);
      setPendingEmail('');
      setVerificationCode('');
    } catch (error) {
      alert('Código de verificación incorrecto');
    }
  };

  if (showVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Mail className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">Verificar Correo</h1>
            <p className="text-gray-600 mt-2">
              Hemos enviado un código de verificación a:<br/>
              <span className="font-semibold">{pendingEmail}</span>
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Verificación
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength="6"
              />
            </div>

            <button
              onClick={handleVerification}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              Verificar
            </button>

            <button
              onClick={() => {
                setShowVerification(false);
                setPendingEmail('');
                setVerificationCode('');
              }}
              className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showRegister) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">Registro de Usuario</h1>
            <p className="text-gray-600 mt-2">Complete todos los campos para crear su cuenta</p>
          </div>

          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">Datos Personales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DNI <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength="8"
                    value={registerData.dni}
                    onChange={(e) => setRegisterData({ ...registerData, dni: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="12345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Nacimiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={registerData.fechaNacimiento}
                    onChange={(e) => setRegisterData({ ...registerData, fechaNacimiento: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={registerData.nombres}
                    onChange={(e) => setRegisterData({ ...registerData, nombres: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Juan Carlos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido Paterno <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={registerData.apellidoPaterno}
                    onChange={(e) => setRegisterData({ ...registerData, apellidoPaterno: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido Materno <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={registerData.apellidoMaterno}
                    onChange={(e) => setRegisterData({ ...registerData, apellidoMaterno: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="García"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength="9"
                    value={registerData.telefono}
                    onChange={(e) => setRegisterData({ ...registerData, telefono: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="987654321"
                  />
                </div>
              </div>
            </div>

            <div className="border-b pb-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">Domicilio</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={registerData.direccion}
                    onChange={(e) => setRegisterData({ ...registerData, direccion: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Av. Principal 123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distrito <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={registerData.distrito}
                    onChange={(e) => setRegisterData({ ...registerData, distrito: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="San Isidro"
                  />
                </div>
              </div>
            </div>

            <div className="border-b pb-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">Datos Familiares</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Padre
                  </label>
                  <input
                    type="text"
                    value={registerData.nombrePadre}
                    onChange={(e) => setRegisterData({ ...registerData, nombrePadre: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Nombre completo del padre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Madre
                  </label>
                  <input
                    type="text"
                    value={registerData.nombreMadre}
                    onChange={(e) => setRegisterData({ ...registerData, nombreMadre: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Nombre completo de la madre"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-4">Datos de Acceso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Repite la contraseña"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setShowRegister(false)}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleRegisterSubmit}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              Registrarse
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            className={`flex-1 py-3 rounded-lg transition-colors ${
              !isAdmin ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Usuario
          </button>
          <button
            onClick={() => setIsAdmin(true)}
            className={`flex-1 py-3 rounded-lg transition-colors ${
              isAdmin ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
              onClick={onShowRegister}
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

// Componente AdminDashboard
const AdminDashboard = ({ reports, allReports, filter, setFilter, stats, calculateRiskZones, getTypeColor, onLogout }) => {
  const riskZones = calculateRiskZones();
  const maxIntensity = Math.max(...riskZones.map(z => z.intensity), 1);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="bg-gradient-to-r from-red-600 to-orange-600 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
                <p className="text-sm text-red-100">Monitoreo de Zonas de Riesgo</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Reportes</p>
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <Shield className="w-12 h-12 text-indigo-600 opacity-20" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Esta Semana</p>
            <p className="text-3xl font-bold text-orange-600">{stats.thisWeek}</p>
          </div>
          <Clock className="w-12 h-12 text-orange-600 opacity-20" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Zonas de Riesgo</p>
            <p className="text-3xl font-bold text-red-600">{riskZones.length}</p>
          </div>
          <MapPin className="w-12 h-12 text-red-600 opacity-20" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Tendencia</p>
            <p className="text-3xl font-bold text-green-600">
              {stats.thisWeek > 0 ? '+' : ''}{stats.thisWeek}
            </p>
          </div>
          <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Mapa de Zonas de Riesgo</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">Todos</option>
              <option value="robo">Robo</option>
              <option value="asalto">Asalto</option>
              <option value="acoso">Acoso</option>
              <option value="vandalismo">Vandalismo</option>
            </select>
          </div>
        </div>

        <div
          className="relative w-full h-96 bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, #ddd 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          {riskZones.map((zone, idx) => (
            <div
              key={idx}
              className="absolute rounded-lg transition-opacity"
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.size}%`,
                height: `${zone.size}%`,
                backgroundColor: `rgba(239, 68, 68, ${0.2 + (zone.intensity / maxIntensity) * 0.6})`,
                border: '2px solid rgba(239, 68, 68, 0.5)'
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
                {zone.intensity}
              </div>
            </div>
          ))}

          {reports.map(report => {
            const points = typeof report.points === 'string' ? JSON.parse(report.points) : report.points;
            const exactLoc = report.exact_location ? (typeof report.exact_location === 'string' ? JSON.parse(report.exact_location) : report.exact_location) : null;
            
            return (
              <React.Fragment key={report.id}>
                {points.map((point, idx) => (
                  <div
                    key={`${report.id}-${idx}`}
                    className="absolute w-3 h-3 rounded-full border-2 border-white shadow-lg transform -translate-x-1.5 -translate-y-1.5"
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                      backgroundColor: getTypeColor(report.type)
                    }}
                  />
                ))}
                {exactLoc && (
                  <div
                    className="absolute transform -translate-x-2 -translate-y-4"
                    style={{
                      left: `${exactLoc.x}%`,
                      top: `${exactLoc.y}%`
                    }}
                  >
                    <MapPin className="w-4 h-4" style={{ color: getTypeColor(report.type) }} fill="currentColor" />
                  </div>
                )}
              </React.Fragment>
            );
          })}

          <div className="absolute bottom-4 right-4 bg-white/95 px-4 py-3 rounded-lg shadow-lg">
            <p className="text-xs font-semibold text-gray-700 mb-2">Leyenda</p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Robo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Asalto</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Acoso</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Vandalismo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Reportes Recientes</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {allReports.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay reportes aún</p>
          ) : (
            allReports
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map(report => (
                <div key={report.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getTypeColor(report.type) }}
                      />
                      <span className="font-semibold text-sm capitalize">{report.type}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{report.description}</p>
                  <p className="text-xs text-gray-500">Usuario: {report.nombres} {report.apellido_paterno}</p>
                  {report.dni && <p className="text-xs text-gray-500">DNI: {report.dni}</p>}
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  </div>
</div>
);
};
export default App;