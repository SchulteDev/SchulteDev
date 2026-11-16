---
title: Middleware Engineer at Saloodo! (DHL Group)
share-description: "Sole engineer of a Go middleware syncing millions of records from DHL Group's freight platform Saloodo! to Salesforce, with 100% uptime since its go-live."
engagement:
  - "Freelance"
  - "via GULP (subcontractor for Hays AG)"
  - "Part-Time"
  - "Remote"
technologies:
  - "Golang"
  - "PostgreSQL"
  - "Salesforce Bulk API"
  - "Docker"
  - "Kubernetes"
  - "ELK Stack"
  - "Dynatrace"
---

**Context:** Saloodo!, the digital freight platform of DHL Group, keeps Salesforce CRM in sync with
its operational data. I took on this part-time assignment alongside my work at
[Union Investment](/companies/union-investment) to use Go professionally for the first time.

## Role & Contributions

- Sole engineer for the Go middleware that transfers platform data to Salesforce via the Bulk API:
  requirements, architecture, code, tests, deployment and operations.
- Rewrote it from scratch as v3 with a generics-based design of 12 transferrers; production
  go-live in November 2023, 77 releases until November 2024.
- Stateless, fault-tolerant design: a continuous delta synchronization with automatic retries and
  full synchronizations of millions of records per entity, e.g. 5.95 million Quotes in under 11
  hours.
- Tuned queries with SQL EXPLAIN and adjusted table schemas and queries.
- Robust handling of inconsistent source data such as wrong types and malformed JSON.
- Monitoring with the ELK stack and Dynatrace; delivery with GitHub Actions and ArgoCD on
  Kubernetes.

## Results

- 100% production uptime from the go-live in November 2023 to the end of my engagement.
- SELECT times cut by up to 80%.
- 69.7% statement coverage in the core data-selection package; 116 test functions, including
  PostgreSQL integration tests via Dockertest, run in about 16 seconds.
- Updates reach Salesforce within minutes.

## Takeaway

High quality standards paid for themselves quickly, even as a sole developer: tests and automation
made me faster, not slower.
