const pool = require('../config/database');

// Crear reporte
const createReport = async (req, res) => {
    const {
        type,
        description,
        date,
        time,
        testigos,
        detallesAdicionales,
        objetosRobados,
        montoAproximado,
        points,
        exactLocation,
    } = req.body;

    const userId = req.userId;

    try {
        const result = await pool.query(
            `INSERT INTO reports (
        user_id, type, description, date, time, testigos, 
        detalles_adicionales, objetos_robados, monto_aproximado, 
        points, exact_location
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING *`,
            [
                userId, type, description, date, time, testigos,
                detallesAdicionales, objetosRobados, montoAproximado,
                JSON.stringify(points), exactLocation ? JSON.stringify(exactLocation) : null
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Reporte creado exitosamente',
            report: result.rows[0],
        });
    } catch (error) {
        console.error('Error creando reporte:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear reporte'
        });
    }
};

// Obtener todos los reportes (Admin)
const getAllReports = async (req, res) => {
    try {
        const result = await pool.query(`
        SELECT 
        r.*,
        u.nombres,
        u.apellido_paterno,
        u.apellido_materno,
        u.dni,
        u.email
        FROM reports r 
        JOIN users u ON r.user_id = u.id 
        ORDER BY r.created_at DESC
    `);

        const reports = result.rows.map(report => ({
            ...report,
            points: typeof report.points === 'string' ? JSON.parse(report.points) : report.points,
            exact_location: report.exact_location ?
                (typeof report.exact_location === 'string' ? JSON.parse(report.exact_location) : report.exact_location)
                : null
        }));

        res.json({
            success: true,
            reports: reports,
        });
    } catch (error) {
        console.error('Error obteniendo reportes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener reportes',
            error: error.message
        });
    }
};


const getUserReports = async (req, res) => {
    const userId = req.userId;

    try {
        const result = await pool.query(
            'SELECT * FROM reports WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        const reports = result.rows.map(report => ({
            ...report,
            points: typeof report.points === 'string' ? JSON.parse(report.points) : report.points,
            exact_location: report.exact_location ?
                (typeof report.exact_location === 'string' ? JSON.parse(report.exact_location) : report.exact_location)
                : null
        }));

        res.json({
            success: true,
            reports: reports,
        });
    } catch (error) {
        console.error('Error obteniendo reportes del usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener reportes'
        });
    }
};


module.exports = {
    createReport,
    getAllReports,
    getUserReports
};