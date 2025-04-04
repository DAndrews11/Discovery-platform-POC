import { spawn } from 'child_process';

console.log('Starting client...');
const client = spawn('cd', ['client', '&&', 'npx', 'vite', '--host', '0.0.0.0'], {
  stdio: 'inherit',
  shell: true
});

client.on('error', (error) => {
  console.error('Client error:', error);
}); 