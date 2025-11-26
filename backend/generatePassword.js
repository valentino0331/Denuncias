const bcrypt = require('bcryptjs');

async function generatePassword() {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('=================================');
    console.log('Password original:', password);
    console.log('Password encriptado:', hashedPassword);
    console.log('=================================');
    console.log('\nCopia este hash y úsalo en el UPDATE de PostgreSQL');
}

generatePassword();