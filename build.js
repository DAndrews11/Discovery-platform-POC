import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

// Ensure we're in the project root
const projectRoot = process.cwd();
const clientDir = path.join(projectRoot, 'client');
const serverPublicDir = path.join(projectRoot, 'server/public');

// Create public directory if it doesn't exist
if (!fs.existsSync(serverPublicDir)) {
    fs.mkdirSync(serverPublicDir, { recursive: true });
}

console.log('Building client...');
exec('cd client && npm run build', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error building client: ${error}`);
        return;
    }
    
    console.log('Client build output:', stdout);
    
    // Copy build files to server/public
    console.log('Copying build files to server/public...');
    exec(`cp -r ${path.join(clientDir, 'dist')}/* ${serverPublicDir}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error copying files: ${error}`);
            return;
        }
        console.log('Build files copied successfully!');
    });
}); 