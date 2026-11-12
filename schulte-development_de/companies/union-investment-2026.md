---
layout: page
css: /assets/main.css
title: IT Architect & Platform Engineer at Union Investment
---

### April 2026 — Present: IT Architect & Platform Engineer at Union Investment

*Freelance \| Part-Time \| Remote, occasionally on-site in Frankfurt*

**Context:** Back at Union Investment in the "Web Portals" domain. My home is the team that builds
and operates the public financial calculators on union-investment.de and in the B2B portal
InvestmentWelt – each shipped as standalone React app and as Web Component, backed by a Quarkus
platform integrating third-party calculation engines.

**Role & Contributions:**

- IT architect for three teams of the funds squad; hands-on in the calculator team, owning
  architecture, CI/CD, release, infrastructure, test strategy and dependency hygiene.
- Architecture work cut into small stories that each go from dev to prod on their own, reusing
  what is already in place; decisions documented as ADRs and presented in the architecture CoP.
- Per-branch preview environments on Azure Static Web Apps with post-deployment tests before the
  merge to main.
- Team-run release automation with ITSM change integration; Terraform moved into the monorepo with
  guards against destructive changes.
- Request origin attribution for 15+ embedded calculators via W3C Trace Context and OpenTelemetry
  baggage – one change in the shared bootstrap, no change to any calculator app.
- Took over a customer-facing conversational platform from an external agency as a static build
  in the existing monorepo – from first assessment to production in ~4 weeks, deadline met.
- Security and quality: penetration-test finding remediated via the managed enterprise edge, SBOMs
  across four repositories, SonarQube analysis and coverage gates.

**Measured Results (May vs. November 2026):**

- Dependency updates ~9× faster: median time-to-merge of Renovate PRs from ~2 h to 13 min.
- Unit tests 3×: 538 → 1,659 test cases; 80% coverage gates in 17 packages.
- Unit-test run 2.7× faster; deploy step from 45–81 s to 26 s.
- 4–7 production releases per month, run by the team itself.
- Release pipeline of the calculator backend ~3× shorter (estimated): one tested build promoted
  through the stages.

**Key Technologies:**
React, TypeScript, Vite, Web Components, Java 25, Quarkus, pnpm, Turborepo, Nx, Vitest, Playwright,
Azure Static Web Apps, Front Door/WAF, API Management, AKS, Terraform, Azure DevOps, Renovate,
SonarQube, CycloneDX SBOMs, OpenTelemetry.

<span style="float: right;">[Back](/#my-career)</span>
