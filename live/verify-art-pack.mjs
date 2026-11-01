// Validate binary art payload installed from the GPT-generated asset ZIP.
// Usage: from live/ -> node verify-art-pack.mjs --required
import {readFileSync,existsSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const DIR=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(DIR,'..');
const manifest=JSON.parse(readFileSync(path.join(root,'docs','V3_ART_EXPECTED_ASSETS.json'),'utf8'));
const base=path.resolve(root,manifest.basePath);
let fail=0,bytes=0;
for(const rel of manifest.requiredFiles){
  const p=path.resolve(base,rel);
  if(!p.startsWith(base+path.sep))throw Error('Unsafe path '+rel);
  if(!existsSync(p)){console.log('MISSING',rel);fail++;continue;}
  const raw=readFileSync(p);
  if(raw.toString('ascii',0,4)!=='RIFF'||raw.toString('ascii',8,12)!=='WEBP'){
    console.error('INVALID_WEBP',rel);fail++;continue;
  }
  bytes+=statSync(p).size;
}
const ready=fail===0;
console.log(JSON.stringify({installed:ready,total:manifest.requiredFiles.length,missingOrInvalid:fail,bytes}));
if(!ready&&process.argv.includes('--required'))process.exitCode=1;
