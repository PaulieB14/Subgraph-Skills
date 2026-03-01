#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const os = require("os");

const HOME = process.env.HOME || process.env.USERPROFILE || os.homedir();
const SKILLS_SRC = path.join(__dirname, "..", "skills");

function resolveDir(p) {
  return path.resolve(p.replace(/^~($|\/)/, HOME + "$1"));
}

function parseArgs() {
  const args = process.argv.slice(2);
  let targetDir = null;
  let claude = false, cursor = false, gemini = false, codex = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--help" || args[i] === "-h") return { help: true };
    if (args[i] === "--claude")  { claude = true; continue; }
    if (args[i] === "--cursor")  { cursor = true; continue; }
    if (args[i] === "--gemini")  { gemini = true; continue; }
    if (args[i] === "--codex")   { codex = true; continue; }
    if (args[i] === "--path" && args[i + 1]) { targetDir = args[++i]; continue; }
  }

  if (!targetDir) {
    if (claude)  targetDir = ".claude/skills";
    else if (cursor)  targetDir = ".cursor/skills";
    else if (gemini)  targetDir = ".gemini/skills";
    else if (codex)   targetDir = ".codex/skills";
    else              targetDir = ".claude/skills"; // default
  }

  return { targetDir, help: false };
}

function copySkills(destDir) {
  fs.mkdirSync(destDir, { recursive: true });

  const skills = fs.readdirSync(SKILLS_SRC);
  let count = 0;

  for (const skill of skills) {
    const srcSkillDir = path.join(SKILLS_SRC, skill);
    const destSkillDir = path.join(destDir, skill);

    if (!fs.statSync(srcSkillDir).isDirectory()) continue;

    fs.mkdirSync(destSkillDir, { recursive: true });

    const files = fs.readdirSync(srcSkillDir);
    for (const file of files) {
      fs.copyFileSync(
        path.join(srcSkillDir, file),
        path.join(destSkillDir, file)
      );
    }
    count++;
  }
  return count;
}

function printHelp() {
  console.log(`
subgraphs-skills — Install The Graph subgraph development skills

Usage:
  npx subgraphs-skills [options]

Options:
  --claude    Install to .claude/skills/ (default)
  --cursor    Install to .cursor/skills/
  --gemini    Install to .gemini/skills/
  --codex     Install to .codex/skills/
  --path DIR  Install to a custom directory
  --help      Show this help

Skills included:
  subgraph-dev          Schema design, mappings, deployment
  subgraph-optimization Pruning, immutable entities, performance
  subgraph-testing      Matchstick tests, Subgraph Linter, CI/CD

Examples:
  npx subgraphs-skills --claude
  npx subgraphs-skills --cursor
  npx subgraphs-skills --path ~/.my-agent/skills
`);
}

const { help, targetDir } = parseArgs();

if (help) {
  printHelp();
  process.exit(0);
}

const dest = resolveDir(targetDir);
console.log(`\nInstalling subgraphs-skills to ${dest}...\n`);

try {
  const count = copySkills(dest);
  console.log(`✓ Installed ${count} skills to ${dest}`);
  console.log(`\nSkills ready! Use them in Claude Code:`);
  console.log(`  "Help me develop a subgraph for Uniswap V3"`);
  console.log(`  "Optimize my subgraph indexing speed"`);
  console.log(`  "Write Matchstick tests for my Transfer handler"\n`);
} catch (err) {
  console.error(`✗ Installation failed: ${err.message}`);
  process.exit(1);
}
