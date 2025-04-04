import { spawn } from 'child_process';

console.log('Starting server...');
const server = spawn('npx', ['tsx', 'server/src/index.ts'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: '3000'
  }
});

server.on('error', (error) => {
  console.error('Server error:', error);
}); 