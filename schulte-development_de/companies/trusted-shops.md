---
title: Senior Software Engineer at Trusted Shops
share-description: "Senior software engineer at Trusted Shops: Salesforce and Zuora integration, AWS Lambda services with Terraform, Twilio SMS delivery, contract testing."
engagement:
  - "Freelance"
  - "Cologne"
technologies:
  - "AWS (Lambda, API Gateway, EKS, S3, SQS, CloudWatch)"
  - "Java"
  - "Spring Boot"
  - "Micronaut"
  - "Pact"
  - "Terraform"
  - "Docker"
  - "Twilio"
  - "Salesforce"
  - "Zuora"
---

**Context:** Trusted Shops, an e-commerce trust provider, was moving from a JavaEE 6 monolith to
cloud-native services on AWS. I worked in the Subscription team first, then in the MARS unit.

## Role & Contributions

### Subscription team (Aug 2018 — Apr 2019)

- Built the self-service Upgrade Center (AddShop, AddOption, AddLocalStore) and the Salesforce and
  Zuora integration of the customer portal MyTS.
- Automated Zuora debit memos and invoice creation; rebuilt the AWS infrastructure of the Zuora
  Lambdas with Terraform and set up continuous deployment.
- Docker development environment for MyTS; concepts for the technical QA phase.

### MARS unit (May — Oct 2019)

- Evaluated SMS providers, chose Twilio and built the SMS delivery.
- Designed and built the invite-reminder system; load-tested the invite scheduler.
- Evaluated Micronaut for Java Lambdas and created a reusable Lambda template for the team.
- Refactored the template and message-delivery services along Clean Code principles; metrics in
  Grafana with Prometheus and CloudWatch.
- Trained teams in contract testing with Pact and introduced it across services.

## Results

- Contributions to 13+ repositories, from the Zuora Lambdas to the MyTS portal.
- A reusable Micronaut Lambda template adopted by the team.

## Takeaway

This was my first real microservices landscape: simple changes often touched many services, and
without enough tests and automation they were hard to maintain. Since then I prefer Self-contained
Systems as the overall architecture, as later at [Union Investment](/companies/union-investment).
