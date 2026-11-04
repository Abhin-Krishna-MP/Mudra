import { existsSync, writeFileSync, mkdirSync, chmodSync } from 'node:fs';
if (!existsSync('.git')) { console.log('[hooks] no .git yet; run `npm run prepare` after git init'); process.exit(0); }
mkdirSync('.git/hooks', { recursive: true });
writeFileSync('.git/hooks/pre-commit', '#!/bin/sh\nnode scripts/check-secrets.mjs || exit 1\n');
chmodSync('.git/hooks/pre-commit', 0o755);
console.log('[hooks] pre-commit check-secrets installed');
