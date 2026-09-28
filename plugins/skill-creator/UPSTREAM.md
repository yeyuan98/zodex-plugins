# Upstream

## Origin

- Repository: https://github.com/anthropics/skills
- Path in repo: `skills/skill-creator/`
- Fetched from branch `main` at commit `33375500bcea98d610eb30ce10ac4e59b89c390d`
  (2026-09-24); fetched on 2026-09-28 via the GitHub git-blobs API (file-for-file,
  byte-identical for everything except `SKILL.md`, see adaptations).
- License: Apache License 2.0 — the upstream `skills/skill-creator/LICENSE.txt`
  is included verbatim at [`LICENSE.txt`](./LICENSE.txt) (and, as upstream ships
  it, also inside [`skills/skill-creator/LICENSE.txt`](./skills/skill-creator/LICENSE.txt)).
- Upstream files fetched (17): `SKILL.md`, `LICENSE.txt`, `agents/analyzer.md`,
  `agents/comparator.md`, `agents/grader.md`, `assets/eval_review.html`,
  `eval-viewer/generate_review.py`, `eval-viewer/viewer.html`,
  `references/schemas.md`, `scripts/__init__.py`, `scripts/aggregate_benchmark.py`,
  `scripts/generate_report.py`, `scripts/improve_description.py`,
  `scripts/package_skill.py`, `scripts/quick_validate.py`, `scripts/run_eval.py`,
  `scripts/run_loop.py`, `scripts/utils.py`.

## Packaging by libre-zcode (2026-09-28)

Packaged as a ZCode plugin for the `zcode-plugins-libre` marketplace:

- Added `.zcode-plugin/plugin.json` (name `skill-creator`, version `1.0.0`,
  `skills: ["skills/skill-creator"]`); the skill tree is mounted under
  `skills/skill-creator/` unchanged.
- Added this `UPSTREAM.md` and a `README.md`.
- Skill content, scripts, agents, references, assets, and license text are
  otherwise unmodified from the commit above.

## Adaptations (SKILL.md only, tool-agnostic wording)

Anthropic-specific harness references in `SKILL.md` were neutralized so the
skill reads tool-agnostically. Every edit is listed below; nothing else in the
package was modified. All other files (including all Python scripts) are
byte-identical to upstream — note `scripts/run_eval.py` and `scripts/run_loop.py`
do invoke Anthropic's `claude` CLI; that is upstream behavior, described
honestly in the adapted SKILL.md wording.

1. "run claude-with-access-to-the-skill on them" → "run the agent with the skill enabled on them".
2. "the power of Claude is inspiring plumbers" → "the power of coding agents is inspiring plumbers".
3. "What should this skill enable Claude to do?" → "What should this skill enable the agent to do?".
4. "currently Claude has a tendency to \"undertrigger\" skills" → "currently agents have a tendency to \"undertrigger\" skills".
5. Dashboard description example: "internal Anthropic data" → "internal company data" (twice within the example).
6. "Claude reads only the relevant reference file." → "The agent reads only the relevant reference file.".
7. "Do NOT use `/skill-test` or any other testing skill." → "Do NOT delegate this to a separate testing skill or command.".
8. "determines whether Claude invokes a skill" → "determines whether the agent invokes a skill".
9. "something a Claude Code or Claude.ai user would actually type" → "something a user of an agentic coding tool would actually type".
10. "then calls Claude to propose improvements" → "then calls the model to propose improvements".
11. Triggering-mechanism paragraph: "Claude's `available_skills` list"/"Claude decides"/"Claude only consults"/"Claude can handle" → agent phrasing ("the agent's available-skills list", "the agent decides", etc.).
12. "substantive enough that Claude would actually benefit" → "substantive enough that the agent would actually benefit".
13. Section "Claude.ai-specific instructions" → "Environments without subagents"; intro "In Claude.ai … because Claude.ai doesn't have subagents" → "In environments without subagents (for example hosted chat products) … because there are no subagents".
14. "e.g., Claude.ai's VM has no display" → "e.g., a hosted VM with no display".
15. "This section requires the `claude` CLI tool (specifically `claude -p`) which is only available in Claude Code. Skip it if you're on Claude.ai." → "This section requires a non-interactive agent CLI that the bundled scripts can drive (they invoke Anthropic's `claude` CLI by default). Skip it if no such CLI is available in your environment."
16. "On Claude.ai, you can run it and the user can download…" → "In such environments, you can run it and the user can download…".
17. Section "Cowork-Specific Instructions" → "Headless environments"; "If you're in Cowork" → "If you're in a headless environment without a browser or display"; "You have subagents, so the main workflow … all works" → "If you have subagents, the main workflow … all works".
18. Removed the product-specific observation "the Cowork setup seems to disincline Claude from generating the eval viewer … whether you're in Cowork or in Claude Code" → "Just to reiterate: after running tests, you should always generate the eval viewer …" (kept the ALL-CAPS emphasis sentence intact).
19. "Description optimization (`run_loop.py` / `run_eval.py`) should work in Cowork just fine since it uses `claude -p` via subprocess" → "… drives a non-interactive agent CLI via subprocess (Anthropic's `claude` by default)".
20. "Follow the update guidance in the claude.ai section above." → "Follow the update guidance in the environments-without-subagents section above.".
21. "Run claude-with-access-to-the-skill on test prompts" → "Run the agent with the skill enabled on test prompts".
22. "If you're in Cowork, please specifically put …" → "If you're in a headless environment, please specifically put …".
23. "Package and Present (only if `present_files` tool is available)" / "Check whether you have access to the `present_files` tool" → "only if a file-presentation tool is available" / "Check whether you have access to a file-presentation tool (some environments expose one, e.g. `present_files`)".
24. "**Cowork / headless environments:**" → "**Headless environments:**".
