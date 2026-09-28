# Upstream

This plugin imports the Agent Skills bundled in the official GitLab CLI
repository:

- Repository: https://gitlab.com/gitlab-org/cli
- Source release: `v1.112.0`
- Source commit: `816e3a52411aba73d90237859fdc6ecbc86bd169`
- Imported on: 2026-08-11
- Imported paths:
  - `internal/commands/skills/bundled/assets/glab/SKILL.md`
  - `internal/commands/skills/bundled/assets/glab-stack/SKILL.md`
- License: MIT, included in [`LICENSE`](./LICENSE)

The ZCode adaptation tracks the skills shipped by `glab v1.112.0` and adds
ZCode/Claude compatibility manifests, bilingual
marketplace documentation, `/gitlab:setup`, a shared binary/authentication
preflight, installed-version capability checks, and explicit confirmation for
destructive GitLab operations. The imported workflow content remains derived
from the official GitLab CLI source.

## Re-host by libre-zcode (2026-09-28)

This copy is re-hosted by [libre-zcode](https://github.com/yeyuan98/zcode-plugins)
for the `zcode-plugins-libre` marketplace, from the Z.ai official-marketplace
plugin artifact `https://cdn-zcode.z.ai/zcode/official-plugin/plugins/gitlab/0.1.3/plugin.zip` (sha256 `398816e8782b1aa40b8f1f920805242c3a8688764c3073ef4576f0ae1d602c8a`).

Changes made in this re-host:

- Plugin manifests (`.zcode-plugin/plugin.json` and the `.claude-plugin/plugin.json`
  compatibility mirror): `author` set to the libre-zcode organization block.
  Commands, skills, agents, hooks, and MCP configuration are unchanged.
- README/README_CN: the wrapper-maintainer line now credits libre-zcode instead
  of Z.ai; no functional content changed.
- LICENSE (upstream MIT notice) kept verbatim.
- Everything else — skill content, references, manifests' functional fields,
  upstream license notices — is byte-identical to the Z.ai adaptation.

Upstream credit: the underlying project and its authors are credited above and
in the license notices; the Z.ai adaptation that packaged it for ZCode is
credited in this file's earlier sections and by the artifact hash above.

