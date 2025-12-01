#!/usr/bin/env node

// ============================================================================
// Zip Bundle Script - viz-api 파일들을 날짜가 포함된 zip으로 압축 (Statistics)
// ============================================================================

import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// bundles 폴더에서 가장 최근 빌드 폴더 찾기
const bundlesDir = join(rootDir, 'build-helper', 'bundles');

if (!existsSync(bundlesDir)) {
  console.error('❌ Error: bundles folder not found. Run build first.');
  process.exit(1);
}

const folders = readdirSync(bundlesDir, { withFileTypes: true })
  .filter(d => d.isDirectory() && /^\d{12}$/.test(d.name))
  .map(d => d.name)
  .sort()
  .reverse();

if (folders.length === 0) {
  console.error('❌ Error: No build folders found. Run build first.');
  process.exit(1);
}

const dateTimeStr = folders[0]; // 가장 최근 폴더
console.log(`📁 Found latest build folder: ${dateTimeStr}`);

// 빌드 폴더 경로
const buildDir = join(bundlesDir, dateTimeStr);

// zip 파일명
const zipFileName = `viz-api-bundle-${dateTimeStr}.zip`;
const zipFilePath = join(buildDir, zipFileName);

// 압축할 파일 목록
const filesToZip = [
  'viz-api.js',
  'viz-api.js.map',
  'viz-api.esm.js',
  'viz-api.esm.js.map'
];

try {
  // 빌드 폴더 존재 확인
  if (!existsSync(buildDir)) {
    console.error(`❌ Error: build folder not found at ${buildDir}. Run build first.`);
    process.exit(1);
  }

  // 파일 존재 확인
  for (const file of filesToZip) {
    const filePath = join(buildDir, file);
    if (!existsSync(filePath)) {
      console.error(`❌ Error: ${file} not found in build folder.`);
      process.exit(1);
    }
  }

  // 기존 zip 파일 삭제 (있다면)
  if (existsSync(zipFilePath)) {
    execSync(process.platform === 'win32'
      ? `del "${zipFilePath}"`
      : `rm "${zipFilePath}"`, { cwd: buildDir });
    console.log(`🗑️  Removed existing ${zipFileName}`);
  }

  // 압축 명령어 (Windows: PowerShell, Unix: zip)
  if (process.platform === 'win32') {
    // PowerShell Compress-Archive 사용
    const files = filesToZip.map(f => `"${join(buildDir, f)}"`).join(', ');
    const psCommand = `powershell -Command "Compress-Archive -Path ${files} -DestinationPath '${zipFilePath}' -Force"`;
    execSync(psCommand, { stdio: 'inherit' });
  } else {
    const zipCommand = `zip -j "${zipFileName}" ${filesToZip.join(' ')}`;
    execSync(zipCommand, { cwd: buildDir, stdio: 'inherit' });
  }

  console.log(`\n✅ Successfully created: build-helper/bundles/${dateTimeStr}/${zipFileName}`);
  console.log(`📦 Contains: ${filesToZip.join(', ')}`);

} catch (error) {
  console.error('❌ Error creating zip file:', error.message);
  process.exit(1);
}
