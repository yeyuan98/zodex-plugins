# Upstream provenance

- Repository: https://github.com/TencentCloudBase/cloudbase-skills
- Tag: `v2026.07.15.1305`
- Commit: `856a308316e7b8c944cf16c49c193c5beb931f54`
- Upstream skill version: `2.23.11`
- License: MIT

## ZCode packaging changes

- Added ZCode and Claude-compatible plugin manifests.
- Added a ZCode plugin MCP declaration pinned to `@cloudbase/cloudbase-mcp@2.23.11`.
- Added bilingual plugin usage documentation.
- Kept the upstream `skills/cloudbase` content unchanged.

## Re-host by libre-zcode (2026-09-28)

This copy is re-hosted by [libre-zcode](https://github.com/yeyuan98/zcode-plugins)
for the `zcode-plugins-libre` marketplace, from the Z.ai official-marketplace
plugin artifact `https://cdn-zcode.z.ai/zcode/official-plugin/plugins/cloudbase-skills/0.1.0/plugin.zip` (sha256 `d60429f6ed70ef7e16b4f1a11b9afccd28dbef1118eb760f3d045bf7726c7f7c`).

Changes made in this re-host:

- Plugin manifests (`.zcode-plugin/plugin.json` and the `.claude-plugin/plugin.json`
  compatibility mirror): `author` set to the libre-zcode organization block.
  Commands, skills, agents, hooks, and MCP configuration are unchanged.
- README/README_CN: the wrapper-maintainer line now credits libre-zcode instead
  of Z.ai; no functional content changed.
- LICENSE (upstream MIT notice) and the pinned `@cloudbase/cloudbase-mcp@2.23.11` `.mcp.json` kept verbatim; the MCP server is the upstream CloudBase package from npm, not a Z.ai service.
- Everything else — skill content, references, manifests' functional fields,
  upstream license notices — is byte-identical to the Z.ai adaptation.

Upstream credit: the underlying project and its authors are credited above and
in the license notices; the Z.ai adaptation that packaged it for ZCode is
credited in this file's earlier sections and by the artifact hash above.

