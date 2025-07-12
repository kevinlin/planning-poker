const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../app/api');
const tempDir = path.join(__dirname, '../temp-api-backup');

if (process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true') {
  console.log('Preparing for static export - removing API routes...');
  
  if (fs.existsSync(apiDir)) {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    fs.renameSync(apiDir, tempDir);
    console.log('API routes moved outside app directory');
  }
} else {
  console.log('Restoring API routes for dynamic build...');
  
  if (fs.existsSync(tempDir)) {
    if (fs.existsSync(apiDir)) {
      fs.rmSync(apiDir, { recursive: true });
    }
    fs.renameSync(tempDir, apiDir);
    console.log('API routes restored from temp directory');
  }
} 