# Premium commercial integration

Base: a8ab4e60b3e5556638cffd150fea99704e524c85. Branch: codex/premium-commercial-experience.

Baseline: all77 tests pass and production build passes before edits. Original showroom routes, scenes/cameras, twin/model assets, control, sizing/economics, account/OS, AI, firmware and shared design tokens remain protected by the existing SHA-256 check. New experiences replace only the separate commercial layer. No header/camera changes are needed. One existing-style footer link makes the commercial portal discoverable; its own navigation provides a showroom-return link.

Architecture: src/commercial contains the 3D workbench, geographic network, customer economics, incentive journey, developer proposals and editorial company experience. Existing src/gen1 adapter/economics and src/twin/model assets are reused through new adapters, without modifying their protected sources. Public research and public supplier listing prices remain traceable. Customer/developer scenario math is distinct from private company forecasts.

Privacy: remove automatic publication of company forecasts, investor decks, founder narratives and application drafts. Preserve local copies outside Git. Only an explicit resource allowlist enters the website. A client-side password/demo session is not access control and is not used. Removing current files cannot retract previous Git history, clones or already-published copies; no history rewrite or production setting change is attempted.

Browser baseline attempt: computer-use in-app browser selection timed out. No screenshot baseline or interaction recording is claimed. Retry visual checks after implementation if tooling recovers; preserve byte-level and functional verification regardless.
