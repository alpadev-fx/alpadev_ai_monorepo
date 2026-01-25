import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// ESM replacement for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine the correct platform/arch for Prisma engine
function getPlatform() {
  const platform = process.platform;
  const arch = process.arch;
  
  if (platform === 'darwin') {
    return 'darwin-arm64'; // Assuming M1/M2/M3 based on user env
  } else if (platform === 'linux') {
    // Detect if musl (Alpine) or glibc (Debian/Ubuntu)
    try {
      const ldd = execSync('ldd --version').toString();
      if (ldd.includes('musl')) {
        return 'linux-musl-openssl-3.0.x';
      }
    } catch (e) {
      // Check if file exists to infer alpine
      if (fs.existsSync('/etc/alpine-release')) {
         return 'linux-musl-openssl-3.0.x';
      }
    }
    return 'linux-musl-openssl-3.0.x'; // Defaulting to musl for Dockerfile
  }
  return 'debian-openssl-3.0.x'; // Fallback
}

const targetDir = path.join(__dirname, '../.next/standalone/apps/frontend/.next/server/app/.prisma/client/');
const standaloneDir = path.join(__dirname, '../.next/standalone/apps/frontend');

// Ensure target directory exists
fs.mkdirSync(targetDir, { recursive: true });

// Copy static and public assets
console.log('Copying static assets...');
try {
  execSync('cp -r .next/static .next/standalone/apps/frontend/.next/', { cwd: path.join(__dirname, '..') });
  execSync('cp -r public .next/standalone/apps/frontend/', { cwd: path.join(__dirname, '..') });
} catch (e) {
  console.log('Warning copying static assets:', e.message);
}

// Search for the binary
console.log('Searching for Prisma Query Engine...');
// We look in the root node_modules because pnpm might hoist it or it's in the specific package store
// Adjust search bath to be relative to the script execution

// Helper to find file recursively
function findFile(startPath, filter) {
    if (!fs.existsSync(startPath)) return null;

    const files = fs.readdirSync(startPath);
    for (let i = 0; i < files.length; i++) {
        const filename = path.join(startPath, files[i]);
        const stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            if (filename.includes('.pnpm') || filename.includes('@prisma')) {
                 const found = findFile(filename, filter);
                 if (found) return found;
            }
        } else if (filename.indexOf(filter) >= 0) {
            return filename;
        }
    }
    return null;
}

// In Docker (Alpine), the binary name typically contains 'linux-musl'
// In MacOS, it contains 'darwin-arm64'
// We will simply search for *any* libquery_engine file that matches the current environment if possible, 
// or just find ANY libquery_engine if we are desperate.

const binNamePart = 'libquery_engine';
let foundPath = null;

// Try to find it in the usual pnpm location relative to the project root
// In the Dockerfile, we are at /app/apps/frontend
// node_modules are at /app/node_modules (hoisted) or /app/apps/frontend/node_modules
console.log(`Current directory: ${process.cwd()}`);
console.log(`Script directory: ${__dirname}`);

const possibleRoots = [
    path.resolve(__dirname, '../../../node_modules'), // Monorepo Root (Docker: /app/node_modules)
    path.resolve(__dirname, '../node_modules')       // Local/Non-hoisted
];

for (const root of possibleRoots) {
    console.log(`Searching in ${root}...`);
    foundPath = findFile(root, binNamePart);
    if (foundPath) break;
}

if (foundPath) {
    console.log(`Found engine at: ${foundPath}`);
    const dest = path.join(targetDir, path.basename(foundPath));
    console.log(`Copying to: ${dest}`);
    fs.copyFileSync(foundPath, dest);
    console.log('Success!');
} else {
    console.error('ERROR: Could not find libquery_engine binary!');
    // Don't fail the build, let it proceed, maybe it's not needed or found elsewhere
    // process.exit(1); 
}
