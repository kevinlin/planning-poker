const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../app/api');
const apiBackupDir = path.join(__dirname, '../app/api.backup');

if (process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true') {
  console.log('Preparing for static export - moving API routes...');
  
  if (fs.existsSync(apiDir)) {
    if (fs.existsSync(apiBackupDir)) {
      fs.rmSync(apiBackupDir, { recursive: true });
    }
    fs.renameSync(apiDir, apiBackupDir);
    console.log('API routes moved to backup directory');
  }
} else {
  console.log('Restoring API routes for dynamic build...');
  
  if (fs.existsSync(apiBackupDir)) {
    if (fs.existsSync(apiDir)) {
      fs.rmSync(apiDir, { recursive: true });
    }
    fs.renameSync(apiBackupDir, apiDir);
    console.log('API routes restored from backup directory');
  }
} 