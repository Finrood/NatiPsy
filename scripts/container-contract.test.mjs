import assert from 'node:assert/strict';
import fs from 'node:fs';

const dockerfile = fs.readFileSync('Dockerfile', 'utf8');
const compose = fs.readFileSync('docker-compose.yml', 'utf8');
const nginx = fs.readFileSync('nginx.conf', 'utf8');
const readme = fs.readFileSync('README.md', 'utf8');

assert.match(dockerfile, /FROM node:22\.22\.3-alpine3\.22@sha256:[a-f0-9]{64}/);
assert.match(dockerfile, /FROM nginxinc\/nginx-unprivileged:1\.27\.5-alpine@sha256:[a-f0-9]{64}/);
assert.match(dockerfile, /USER 101:101/);
assert.match(dockerfile, /npm --version/);
assert.match(dockerfile, /npm ci --ignore-scripts --no-audit --no-fund/);
assert.match(dockerfile, /HEALTHCHECK[\s\S]*127\.0\.0\.1:8080\/index\.html/);
assert.match(dockerfile, /EXPOSE 8080/);
assert.match(nginx, /listen 8080/);
assert.match(compose, /read_only: true/);
assert.match(compose, /user: "101:101"/);
assert.match(compose, /- ALL/);
assert.match(compose, /no-new-privileges:true/);
assert.match(compose, /\/var\/cache\/nginx/);
assert.match(compose, /127\.0\.0\.1:8080\/index\.html/);
assert.match(compose, /external: true/);
assert.match(readme, /docker network create caddy-network/);
assert.match(readme, /psicologa-web:8080/);
assert.match(fs.readFileSync('.dockerignore', 'utf8'), /node_modules/);

console.log('Container reproducibility and hardening contract passed.');
