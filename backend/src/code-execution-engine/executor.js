const { spawn } = require('child_process');

exports.executeCode = (language, code, input) => {
  return new Promise((resolve, reject) => {
    let command, args;

    // Based on the project plan, we need to support multiple languages
    switch (language) {
      case 'python':
        command = 'docker';
        args = ['run', '--rm', '-i', 'python-runner', 'python', '-c', code];
        break;
      case 'java':
        // A more complex setup is needed for Java, including compiling
        // This is a placeholder
        reject('Java execution not yet implemented.');
        return;
      default:
        reject('Unsupported language.');
        return;
    }

    const dockerProcess = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });

    let output = '';
    let errorOutput = '';

    dockerProcess.stdin.write(input);
    dockerProcess.stdin.end();

    dockerProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    dockerProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    dockerProcess.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(errorOutput || `Process exited with code ${code}`);
      }
    });

    dockerProcess.on('error', (err) => {
      reject(err.message);
    });
  });
};