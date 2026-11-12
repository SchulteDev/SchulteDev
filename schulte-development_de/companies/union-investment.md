---
title: Software Lead & Cloud Architect at Union Investment
share-description: "Software lead at Union Investment: microfrontend toolkit, event-driven search and DevOps for the B2B platform InvestmentWelt; urgent deploys in 30 minutes."
engagement:
  - "Freelance"
  - "Remote"
technologies:
  - "Azure (Static Web App, Functions, Event Hubs, AD B2C)"
  - "JavaScript/TypeScript"
  - "Node.js"
  - "Java"
  - "Lit framework"
  - "Self-contained Systems (SCS)"
  - "Microfrontends"
  - "Microservices"
  - "Event-driven Architecture"
  - "Algolia"
  - "Nx"
  - "Lerna"
  - "Terraform"
  - "Docker"
  - "SonarQube"
  - "Jest"
  - "Playwright"
---

**Context:** Union Investment, a leading German asset manager, modernized InvestmentWelt, its
business-critical B2B sales platform for ~80,000 users, from a Liferay/FirstSpirit monolith into
Self-contained Systems. Architectural responsibility lay with Union Investment; I was the hands-on
software lead of my team.

## Role & Contributions

- Proposed the microfrontend approach that was adopted; designed and built the microfrontend
  toolkit and the B2B portal container app on Web Components, with versioning and automated
  publishing.
- Technical Product Owner and agile coach for 5–7 developers; built a new cross-functional team
  from the ground up and onboarded new members.
- Azure platform: Static Web Apps with Application Insights, Azure AD B2C with a parallel-operation
  concept for gradual domain migration, Terraform workloads, Pipeline-as-Code in Azure DevOps, a
  staging concept, penetration-test support and DDoS protection.
- Cross-system search: evaluated ElasticSearch against Algolia and chose Algolia; the domains
  stream events through Azure Event Hubs and Azure Functions feed the search index. A Java SDK (CDI,
  Avro, TestContainers) made publishing events simple for the domain teams; search microfrontends
  in Lit.
- Quality: SonarQube, a test pyramid with 1,000+ tests at 10-minute builds, automated dependency
  updates with Dependabot and later Renovate.
- Coordinated the December 2023 go-live and the final search go-live across all domains, then
  handed over documentation, operations and knowledge in 2024.

## Results

- Urgent changes deployed in 30 minutes instead of several days.
- 99.9% uptime in production.
- Sub-second search across all domain boundaries.
- ~60 person-days saved by one decision: integrating Web Components right after the proof of
  concept instead of exploring further options.
- The Self-contained Systems pattern became the template for the group's modernization.

## Team Performance & 360° Feedback

Based on comprehensive 360-degree feedback surveys (December 2021, June 2022, November 2024):

- **Technical Competence:** Consistently rated 9-10/10 by team members and stakeholders in 2024
- **Collaboration:** High ratings for pleasant working relationship, averaging 8.6/10 in 2024
- **Leadership:** Strong ratings for driving topics forward (9/10 in 2024)

## Client Testimonials

<div class="testimonials-section">
<div class="testimonial">
  <blockquote>
    In his multi-year engagement in the web portals domain, Markus Schulte very successfully applied
    his outstanding technical expertise and pronounced communicative talent as an architect across
    several teams. His work was always characterized by professionalism, reliability and high
    quality. His structured approach and his ability to analyze complex architectures, share them
    with the team and develop them to the 'next level' have greatly advanced the entire project. His
    ability to convince and inspire colleagues about the opportunities and advantages of technical
    solutions was decisive in setting common goals and achieving them as planned.
  </blockquote>
  <cite>— Direct team colleague, 360° feedback (2024)</cite>
</div>

<div class="testimonial">
  <blockquote>
    Great that you were also easy to reach through informal channels. Thank you for your support.
  </blockquote>
  <cite>— Colleague from the wider project, 360° feedback (2024)</cite>
</div>
</div>
