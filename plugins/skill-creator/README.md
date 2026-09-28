# Skill Creator

[Upstream provenance](./UPSTREAM.md)

A skill for creating new skills and iteratively improving them: draft a skill,
run with-skill vs. baseline test cases, grade assertions, aggregate benchmarks,
review results with the eval viewer, and optimize the skill description for
better triggering accuracy.

Adapted for ZCode from Anthropic's open-source
[skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator)
(Apache-2.0). The adaptation is packaging plus tool-agnostic wording in
`SKILL.md`; every edit is listed in [`UPSTREAM.md`](./UPSTREAM.md).

## Usage

Once the plugin is enabled, ask for skill authoring work in natural language
(for example "help me turn this workflow into a skill and test it"), or invoke
`/skill-creator:skill-creator`. The skill guides the full loop:

1. Capture intent, interview, and research.
2. Write the `SKILL.md` draft.
3. Run test prompts with and without the skill (subagents when available).
4. Grade, aggregate into a benchmark, and open the eval viewer.
5. Improve from feedback and repeat.
6. Package the result as a `.skill` file.

## Notes for ZCode

- The eval/benchmark core (grading, aggregation, viewer, packaging) is plain
  Python and works anywhere with Python 3.
- The description-optimization loop (`scripts/run_loop.py`, driven by
  `scripts/run_eval.py`) shells out to a non-interactive agent CLI — upstream
  implemented this against Anthropic's `claude` binary, so it only runs where
  that CLI is available. Everything else is tool-agnostic.
- Requires Python 3.10+ for the bundled scripts.

## License

Apache License 2.0 — see [`LICENSE.txt`](./LICENSE.txt). Upstream copyright
belongs to Anthropic PBC; packaging adaptations are credited in
[`UPSTREAM.md`](./UPSTREAM.md).
