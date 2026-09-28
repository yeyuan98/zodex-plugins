# Upstream

This plugin is a lightweight Skill wrapper around an upstream CLI project. It
contains no bundled binary and no credentials.

## Upstream project

- Repository: https://github.com/larksuite/cli
- License: MIT (declared by the wrapper's original publisher; canonical
  license text is included in [`LICENSE`](./LICENSE) with an honest copyright
  line — the wrapper authors did not receive a dedicated copyright grant, so
  attribution is "contributors", see below)
- Wrapper adaptation: first published by Z.ai in the ZCode official plugin
  marketplace as `lark-cli` version 0.1.2 — artifact
  `https://cdn-zcode.z.ai/zcode/official-plugin/plugins/lark-cli/0.1.2/plugin.zip` (sha256 `b53747950cf99c93da69ef72e481bff0090ab6f132c96db393053fbc282fe487`). That adaptation authored the skills,
  manifests, and bilingual READMEs in this package; no upstream commit is
  recorded for it because the wrapper text is original to the adaptation, not
  an import from the upstream repository.

## Re-host by libre-zcode (2026-09-28)

Re-hosted from the Z.ai artifact above for the `zcode-plugins-libre`
marketplace (https://github.com/yeyuan98/zcode-plugins).

Changes made in this re-host:

- Plugin manifests (`.zcode-plugin/plugin.json` and the `.claude-plugin/plugin.json`
  compatibility mirror): `author` set to the libre-zcode organization block.
  Skills and all functional fields are unchanged; this plugin declares no
  commands, agents, hooks, or MCP servers.
- README/README_CN: the wrapper-maintainer line now credits libre-zcode instead
  of Z.ai; no functional content changed.
- Added `LICENSE` with the canonical MIT text. No copyright grant was
  received for the wrapper text, so the notice reads
  "Lark CLI contributors — see UPSTREAM.md; wrapper packaging (c) 2026 libre-zcode contributors".
- Everything else is byte-identical to the Z.ai adaptation.
