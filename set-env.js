const fs = require('fs');

const targetPath = './src/environments/environment.prod.ts';
const envDirectory = './src/environments';
if (!fs.existsSync(envDirectory)) {
  fs.mkdirSync(envDirectory, { recursive: true });
}

const envConfigFile = `export const environment = {
  production: true,
  backendInternalBaseUrl: '${process.env.BACKEND_INTERNAL_BASE_URL || 'http://localhost:8080/ElectroInternal'}',
  backendCustomerBaseUrl: '${process.env.BACKEND_CUSTOMER_BASE_URL || 'http://localhost:8081/ElectroCustomer'}',
  googleClientId: '${process.env.GOOGLE_CLIENT_ID || '768333056109-uug9hjo77mhp1e9b4kusbd7esbpbd1j9.apps.googleusercontent.com'}'
};`;

fs.writeFile(targetPath, envConfigFile, (err) => {
  if (err) {
    console.error('Error writing environment file:', err);
    throw err;
  }
  console.log('Production environment file generated successfully.');
});
