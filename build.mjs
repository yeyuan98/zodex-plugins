#!/usr/bin/env node
// Deterministic packaging for the zcode-plugins-libre marketplace.
//
// For every plugins/<name>/ directory this script:
//   1. Builds dist/<name>-<version>.zip with a single top-level directory
//      named <name>/ (the layout the ZCode zip installer expects:
//      .zcode-plugin/plugin.json inside one root dir).
//   2. Zips deterministically: entries sorted by path (codepoint order),
//      every timestamp pinned, fixed permissions, deflate level 9 — identical
//      input tree produces a byte-identical zip on any machine.
//   3. Computes sha256 of each zip and regenerates marketplace.json with the
//      release download URLs and hashes.
//
// Usage: node build.mjs          (from the repo root)
//
// Release constants — bump RELEASE_TAG when cutting a new release; the plugin
// zip names embed each plugin's own version, not the release tag.

import { createHash } from "node:crypto";
import { deflateRaw } from "node:zlib";
import { promisify } from "node:util";
import {
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { join, posix } from "node:path";

const deflateRawAsync = promisify(deflateRaw);

const OWNER = { name: "libre-zcode", url: "https://github.com/yeyuan98/zodex-plugins" };
const REPO_URL = "https://github.com/yeyuan98/zodex-plugins";
const RELEASE_TAG = "v1.0.0";
const RELEASE_BASE = `${REPO_URL}/releases/download/${RELEASE_TAG}`;
const RAW_ICONS_BASE = "https://raw.githubusercontent.com/yeyuan98/zodex-plugins/main/icons";

// Pinned zip metadata: 2026-01-01 00:00:00 in local-independent UTC terms.
const DOS_TIME = ((0 << 11) | (0 << 5) | 0) & 0xffff; // 00:00:00
const DOS_DATE = (((2026 - 1980) << 9) | (1 << 5) | 1) & 0xffff; // 2026-01-01
const FILE_MODE = ((0o100644 << 16) | 0) >>> 0;
const DIR_MODE = ((0o40755 << 16) | 0) >>> 0;

// Store-level catalog metadata (everything the plugin manifest does not carry).
// Kept in sync with plugins/<name>/.zcode-plugin/plugin.json + UPSTREAM.md.
const CATALOG = [
  {
    name: "skill-creator",
    displayName: "Skill Creator",
    displayNameI18n: { en: "Skill Creator", "zh-CN": "技能创作器" },
    category: "developer-tools",
    license: "Apache-2.0",
    homepage: "https://github.com/anthropics/skills/tree/main/skills/skill-creator",
    repository: "https://github.com/anthropics/skills",
    keywords: ["skill-creator", "skills", "evals", "benchmark", "agent-skills"],
  },
  {
    name: "gitlab",
    category: "developer-tools",
    license: "MIT",
    homepage: "https://docs.gitlab.com/cli/",
    repository: "https://gitlab.com/gitlab-org/cli",
    keywords: ["gitlab", "glab", "merge-request", "issue", "ci-cd", "gitlab-api"],
  },
  {
    name: "cloudbase-skills",
    category: "developer-tools",
    license: "MIT",
    repository: "https://github.com/TencentCloudBase/cloudbase-skills",
    keywords: ["cloudbase", "tencent-cloud", "wechat", "serverless", "mcp"],
  },
  {
    name: "obsidian",
    displayName: "Obsidian",
    displayNameI18n: { en: "Obsidian", "zh-CN": "Obsidian" },
    category: "productivity",
    license: "MIT",
    repository: "https://github.com/kepano/obsidian-skills",
    keywords: [
      "obsidian", "markdown", "bases", "canvas", "notes",
      "defuddle", "knap", "mermaid", "excalidraw", "visualization",
    ],
  },
  {
    name: "lark-cli",
    displayName: "Lark CLI",
    displayNameI18n: { en: "Lark CLI", "zh-CN": "飞书 CLI" },
    category: "productivity",
    license: "MIT",
    repository: "https://github.com/larksuite/cli",
    keywords: ["feishu", "lark", "lark-cli", "docs", "sheets", "base", "calendar", "messaging"],
  },
  {
    name: "wecom-cli",
    displayName: "WeCom CLI",
    displayNameI18n: { en: "WeCom CLI", "zh-CN": "企业微信 CLI" },
    category: "productivity",
    license: "MIT",
    repository: "https://github.com/WecomTeam/wecom-cli",
    keywords: ["wecom", "wechat-work", "wecom-cli", "message", "docs", "sheets", "calendar", "todo"],
  },
  {
    name: "dingtalk-cli",
    displayName: "DingTalk CLI",
    displayNameI18n: { en: "DingTalk CLI", "zh-CN": "钉钉 CLI" },
    category: "productivity",
    license: "Apache-2.0",
    repository: "https://github.com/DingTalk-Real-AI/dingtalk-workspace-cli",
    keywords: ["dingtalk", "dws", "workspace", "chat", "docs", "calendar", "tasks"],
  },
  {
    name: "tencent-meeting-cli",
    displayName: "Tencent Meeting CLI",
    displayNameI18n: { en: "Tencent Meeting CLI", "zh-CN": "腾讯会议 CLI" },
    category: "productivity",
    license: "Apache-2.0",
    repository: "https://github.com/TencentCloud/tencentmeeting-cli",
    keywords: ["tencent-meeting", "tencentmeeting", "meeting", "cli", "oauth2"],
  },
  {
    name: "alibaba-cloud-cli",
    displayName: "Alibaba Cloud CLI",
    displayNameI18n: { en: "Alibaba Cloud CLI", "zh-CN": "阿里云 CLI" },
    category: "developer-tools",
    license: "Apache-2.0",
    homepage: "https://www.alibabacloud.com/help/en/cli/",
    repository: "https://github.com/aliyun/aliyun-cli",
    keywords: ["alibaba-cloud", "aliyun", "aliyun-cli", "cloud", "ecs", "oss", "ram"],
  },
];

// ---------------------------------------------------------------- zip writer

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

async function collectFiles(rootDir) {
  const files = [];
  const walk = async (relative) => {
    const entries = await readdir(join(rootDir, relative), { withFileTypes: true });
    for (const entry of entries) {
      const relativePath = posix.join(relative, entry.name);
      if (entry.isDirectory()) await walk(relativePath);
      else if (entry.isFile()) files.push(relativePath);
    }
  };
  await walk(".");
  // Codepoint sort = locale-independent, stable across machines.
  return files.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

function dosDateTime() {
  return { time: DOS_TIME, date: DOS_DATE };
}

async function buildDeterministicZip(sourceDir, rootDirName) {
  const relativePaths = await collectFiles(sourceDir);

  // Explicit directory entries (deepest-first is fine; central dir is sorted
  // with the files below) — deduped set of all ancestor directories.
  const dirs = new Set();
  for (const filePath of relativePaths) {
    const segments = filePath.split("/");
    segments.pop();
    let current = "";
    for (const segment of segments) {
      current = current ? `${current}/${segment}` : segment;
      dirs.add(current);
    }
  }

  const { time, date } = dosDateTime();
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const entries = [];

  const pushEntry = async (archivePath, isDir, content) => {
    const nameBytes = Buffer.from(archivePath.endsWith("/") ? archivePath : archivePath + (isDir ? "/" : ""), "utf8");
    const crc = crc32(content);
    let compressed = content;
    let method = 0; // store
    if (!isDir && content.length > 0) {
      compressed = await deflateRawAsync(content, { level: 9 });
      if (compressed.length < content.length) method = 8; // deflate
    }

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0, 6); // flags
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(content.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    local.writeUInt16LE(0, 28); // extra length

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(3 << 8 | 20, 4); // version made by: unix
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(content.length, 24);
    central.writeUInt16LE(nameBytes.length, 28);
    central.writeUInt16LE(0, 30); // extra
    central.writeUInt16LE(0, 32); // comment
    central.writeUInt16LE(0, 34); // disk
    central.writeUInt16LE(0, 36); // internal attrs
    central.writeUInt32LE(isDir ? DIR_MODE : FILE_MODE, 38);
    central.writeUInt32LE(offset, 42);

    localParts.push(local, nameBytes, compressed);
    centralParts.push(central, nameBytes);
    offset += local.length + nameBytes.length + compressed.length;
    entries.push(archivePath);
  };

  // Stable order: directory entries first (sorted), then files (sorted).
  for (const dir of [...dirs].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))) {
    await pushEntry(`${rootDirName}/${dir}`, true, Buffer.alloc(0));
  }
  for (const filePath of relativePaths) {
    const content = await readFile(join(sourceDir, filePath));
    await pushEntry(`${rootDirName}/${filePath}`, false, content);
  }

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(Buffer.concat(centralParts).length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, ...centralParts, eocd]);
}

// ---------------------------------------------------------------- marketplace

async function iconExists(name) {
  try {
    const s = await stat(join("icons", `${name}.png`));
    return s.isFile();
  } catch {
    return false;
  }
}

function entry(name, fields) {
  // Stable, explicit field order for readable diffs.
  const result = { name };
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) result[key] = value;
  }
  return result;
}

async function buildMarketplace(artifacts) {
  const plugins = [];
  for (const item of CATALOG) {
    const manifest = JSON.parse(
      await readFile(join("plugins", item.name, ".zcode-plugin", "plugin.json"), "utf8"),
    );
    if (manifest.name !== item.name) {
      throw new Error(`manifest name mismatch: ${manifest.name} vs ${item.name}`);
    }
    const artifact = artifacts.get(item.name);
    const fields = {
      version: manifest.version,
      displayName: item.displayName ?? manifest.name,
      displayName_i18n: item.displayNameI18n,
      description: manifest.description,
      description_i18n: manifest.description_i18n,
      author: OWNER,
      icon: (await iconExists(item.name))
        ? `${RAW_ICONS_BASE}/${item.name}.png`
        : undefined, // letter-avatar fallback in the store UI
      category: item.category,
      keywords: item.keywords,
      license: item.license,
      homepage: item.homepage ?? manifest.homepage,
      repository: item.repository ?? manifest.repository,
      source: {
        source: "url",
        type: "zip",
        url: `${RELEASE_BASE}/${item.name}-${manifest.version}.zip`,
        sha256: artifact.sha256,
      },
    };
    plugins.push(entry(item.name, fields));
  }

  return {
    name: "zcode-plugins-libre",
    description:
      "Libre plugin marketplace for ZCode: permissively-licensed, provenance-tracked re-hosts of open-source agent skills and CLI wrappers.",
    description_i18n: {
      en: "Libre plugin marketplace for ZCode: permissively-licensed, provenance-tracked re-hosts of open-source agent skills and CLI wrappers.",
      "zh-CN":
        "面向 ZCode 的自由插件市场：仅收录宽松许可证、可追溯来源的开源 Agent 技能与 CLI 封装的再托管镜像。",
    },
    owner: OWNER,
    plugins,
  };
}

// ------------------------------------------------------------------- driver

async function main() {
  const distDir = "dist";
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  const artifacts = new Map();
  for (const item of CATALOG) {
    const sourceDir = join("plugins", item.name);
    const manifest = JSON.parse(
      await readFile(join(sourceDir, ".zcode-plugin", "plugin.json"), "utf8"),
    );
    const zipBuffer = await buildDeterministicZip(sourceDir, item.name);
    const zipName = `${item.name}-${manifest.version}.zip`;
    await writeFile(join(distDir, zipName), zipBuffer);
    const sha256 = createHash("sha256").update(zipBuffer).digest("hex");
    artifacts.set(item.name, { zipName, sha256, size: zipBuffer.length });
    console.log(
      `${zipName}  ${String(zipBuffer.length).padStart(8)} bytes  sha256=${sha256}`,
    );
  }

  const marketplace = await buildMarketplace(artifacts);
  await writeFile("marketplace.json", JSON.stringify(marketplace, null, 2) + "\n", "utf8");
  console.log(`\nmarketplace.json: ${marketplace.plugins.length} plugins, release ${RELEASE_TAG}`);
  console.log(`Next: upload dist/*.zip to the ${RELEASE_TAG} GitHub release.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
