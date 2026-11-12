---
title: Middleware Engineer at Saloodo! (DHL Group)
share-description: "Sole engineer of a Go middleware syncing ~10 million records from DHL Group's freight platform Saloodo! to Salesforce, with 100% uptime over three years."
engagement:
  - "Freelance"
  - "Part-Time"
  - "Remote"
technologies:
  - "Golang"
  - "PostgreSQL"
  - "Salesforce Lightning Cloud"
  - "Docker"
  - "Kubernetes"
  - "ELK Stack"
  - "Dynatrace"
---

**Context:** Saloodo!, the digital freight platform of DHL Group, keeps Salesforce CRM in sync with
its operational data. I took on this part-time assignment alongside my work at
[Union Investment](/companies/union-investment) to use Go professionally for the first time.

## Role & Contributions

- Sole engineer for the Go middleware that transfers platform data to Salesforce Lightning:
  requirements, architecture, code, tests, deployment and operations.
- Stateless, fault-tolerant design: a continuous synchronization loop with automatic retries,
  multi-threaded full synchronizations of ~10 million records and near real-time updates in between.
- Tuned queries with SQL EXPLAIN and adjusted table schemas and queries.
- Robust handling of inconsistent source data such as wrong types and malformed JSON.
- Monitoring with the ELK stack and Dynatrace; delivery with GitHub Actions and ArgoCD on
  Kubernetes.

## Results

- 100% production uptime over three years.
- SELECT times cut by up to 80%.
- 70% test coverage on ~2,800 lines of code; the test suite, including PostgreSQL integration tests
  via Dockertest, runs in 5 seconds.
- Updates reach Salesforce within minutes.

## Takeaway

High quality standards paid for themselves quickly, even as a sole developer: tests and automation
made me faster, not slower.
