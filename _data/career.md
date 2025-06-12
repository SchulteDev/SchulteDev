<!-- 
Comprehensive Professional Timeline

This document provides a factual, chronological record of Markus Schulte's professional career.
It serves as a structured repository of professional experiences, skills, and achievements
to be referenced when creating tailored documents for specific purposes (resume, website, etc.).

It prioritizes personal motives and insights, completeness and accuracy over presentation, 
focusing on technical details and professional growth rather than marketing language.
-->

# Professional Career of Markus Schulte

**Freelance Cloud Architect & Software Engineer**  
**Location:** Cologne (Köln), Germany  
**Contact:** mail@schulte-development.de | +49 178 7217768  
**Website:** https://schulte-development.de  
**LinkedIn:** https://www.linkedin.com/in/markus-schulte/  
**GitHub:** https://github.com/SchulteMarkus  
**StackOverflow:** https://stackoverflow.com/users/1645517/markus-schulte

## Professional Summary

Technology professional with 15+ years in software engineering (10+ as freelancer) specializing in:

- Backend development (Java, Golang)
- Cloud architecture and implementation (AWS, Azure, GCP)
- Microservices and distributed systems
- DevOps and Continuous Integration
- Team Lead

Demonstrated expertise in creating efficient, maintainable solutions for enterprise environments
with a focus on technical excellence and innovation.

## General techniques

### Main programming languages

Java can be described as my programming mother tongue. I have gained a lot of experience with Golang
in recent years and am an advanced user. I have also worked with JavaScript/TypeScript (Node.js/NPM)
from time to time, depending on project requirements.

### Architecture

I have experience in creating both low-level and high-level IT architectures.

### Testing, CI/CD

Extensive automation and software testing are a matter of course for me. I have experience with
pipelines-as-code and the optimisation of test and build executions. I cover the majority of my
programming with unit tests, I have a basic command of the common frameworks for unit and e2e
testing in my programming language. I have experience with the common build tools in the Java,
Golang and JavaScript ecosystem.

### Techniques

- Depending on the application, I generally use Clean Architecture, Clean Code and Conventional
  Commits
- I am used to working with agile process models such as Scrum, Kanban and SAFe

### Leadership

As an IT architect, Head of Development and interim PO, I have proven and developed my
organisational and leadership skills.
I have organised and supported teams in the implementation of complex software projects.

## Professional Experience

### November 2024 — Present: Cloud Architect at LBBW

*[Landesbank Baden-Württemberg](https://en.wikipedia.org/wiki/Landesbank_Baden-W%C3%BCrttemberg) |
Freelance | Remote*

**Context:** Major German state bank and central institution for savings banks in Baden-Württemberg

**Project:** "Phoenix" IT Modernization (~80 people) - Migration to Azure-based "Skywalker" platform

**Timeline:** Since November 2024 (Skywalker platform development started 2023)

**Team:** 9 people (one of 3 teams providing Skywalker platform access)

**Responsibility:** 10 of 30 applications under parallel technical supervision

**Technical Challenges:**

- Cataloging hundreds of legacy applications for Skywalker migration assessment
- Strategic multi-cloud scenario development
  ([Azure](https://azure.microsoft.com), [Elastisys Welkin](https://elastisys.io/welkin/))
- Platform gap identification in production-unused Skywalker environment
- Complex application portfolio with diverse technical stacks requiring individualized migration
  approaches

**Key Contributions:**

- Application cataloging and assessment using
  [R-methodology (cloud migration)](https://aws.amazon.com/de/blogs/enterprise-strategy/6-strategies-for-migrating-applications-to-the-cloud/)
- Multi-cloud strategy development for Azure and potential
  [Elastisys Welkin](https://elastisys.io/welkin/) integration
- Creation of technical templates and analysis processes for application assessment
- Conducting in-depth technical assessments to determine Skywalker compatibility
- IT design and Azure component specification for compatible applications
- Consultation on deployment, backup, and monitoring strategies
- Cost analysis using Azure Calculator for migration planning
- Platform gap identification and improvement initiative support

**Impact:**

- **50% of candidate applications** identified as Skywalker-incompatible → initiated platform
  improvements
- **Platform evolution:** Gap identification enabled targeted Skywalker platform enhancements
- **Migration readiness:** Established comprehensive assessment framework for large-scale enterprise
  migration
- **Technical expertise:** Leveraged experience with Spring Boot, Tomcat, IIS, Oracle, MS-SQL,
  PostgreSQL for rapid application understanding

**Technologies:** Azure, AKS, Kubernetes, Spring Boot, Tomcat, IIS, Oracle, MS-SQL, PostgreSQL

**Tools:** Jira, Confluence, draw.io, Outlook, Citrix, Webex

---

### October 2021 — December 2024: Cloud Architect at Union Investment

*German Asset Management Company | Freelance | Remote*

**Project:** B2B Portals Modernization

**Key Contributions:**

- Led architecture for cloud-native transformation using Self-Contained Systems pattern
- Implemented event-driven architecture with Azure Event Hubs for system integration
- Built cross-system search functionality using Algolia
- Designed microservices and microfrontend architecture for independent team development

**Impact:**

- Modernized legacy systems with improved scalability and maintainability
- Enhanced data discovery across distributed systems
- Established architecture patterns enabling team autonomy

**Technologies:** Azure, Event Hubs, Algolia, Microservices, Microfrontends, SCS

**Programming**: JavaScript/TypeScript, Node.js
**CI/CD**: Git, Azure DevOps (pipeline as code), NPM, Dependabot, Renovate Bot
**Azure**: Static Web App, Functions, Blob, Azure Event Hubs, Algolia
**Architecture**: Self-contained systems SCS, Microfrontends, Microservices

---

### December 2021 — November 2024: Middleware Engineer at Saloodo! (DHL Group)

*[Saloodo!](https://www.saloodo.com) ([DHL](https://en.wikipedia.org/wiki/DHL) Group) | Freelance |
Part-Time | Remote*

**Context:** Digital freight platform requiring seamless integration between operational systems and
Salesforce CRM

**Technical Challenges:**

- **Scale:** Periodic full data synchronization of ~10 million records requiring database query
  optimization and multi-threading
- **Real-time sync:** Near real-time propagation of data updates from Saloodo to Salesforce with
  minimal latency
- **Data inconsistency:** Saloodo's database schema contained numerous inconsistencies including
  incorrect types and malformed JSON values requiring robust error handling
- **Solo ownership:** As the sole developer, responsible for architecture decisions, implementation,
  operations, and monitoring without team support

**Key Contributions:**

- Took on this part-time assignment alongside my work at
  [Union Investment](#october-2021--december-2024-cloud-architect-at-union-investment) as it
  offered the opportunity to use Golang professionally for the first time
- Sole developer for critical middleware component transferring Saloodo platform data to Salesforce
  Lightning Cloud
- Designed and implemented fault-tolerant, stateless architecture with continuous loop execution
  and automatic retry mechanisms
- Achieved 70% test coverage on 2,776 lines of code with 5-second test execution time using
  Dockertest for PostgreSQL integration
- Implemented sophisticated database query optimizations and multi-threading for handling ~10
  million record synchronizations
- Built robust error handling for Saloodo's inconsistent database schema (malformed JSON, incorrect
  types)
- Owned complete software lifecycle: requirements engineering, design, development, monitoring, and
  operations
- Established comprehensive monitoring with ELK Stack and Dynatrace for proactive issue detection

**Impact:**

- **100% production uptime** throughout 3-year tenure through fault-tolerant design and
  comprehensive testing
- **Business-critical operation:** Enabled Saloodo's CRM functionality by maintaining data
  synchronization between operational systems and Salesforce
- **Near real-time performance:** Achieved data propagation within minutes despite Saloodo database
  bottlenecks
- **Continuous operation:** Implemented robust endless-loop architecture handling millions of
  transactions
- Demonstrated production-grade Golang expertise in mission-critical environment
- Proved reliability by providing partial operational readiness support

**Technologies:** Golang, PostgreSQL, Salesforce Lightning Cloud, Salesforce Bulk API, Docker,
Kubernetes

**Frameworks & Tools:**

- **Golang:** cobra/viper (CLI), sqlx (database), testify/dockertest (testing), logrus (logging)
- **CI/CD:** GitHub Actions, Travis CI, ArgoCD, Release Please Bot, Dependabot
- **Monitoring:** ELK Stack (Kibana), Dynatrace
- **Architecture:** Event-driven middleware, bulk data processing, continuous synchronization

---

### June 2016 — December 2023: Creator of Atlassian Bamboo Server Add-ons

*Self-Employed Product Business*

**Product:** Commercial Atlassian Marketplace add-ons integrating code quality metrics
into [Atlassian Bamboo Server CI/CD](https://www.atlassian.com/de/software/bamboo)

During my time at [Xsite](#jan-2014---aug-2016-early-freelancing-projects),
[Atlassian Bamboo Server](https://www.atlassian.com/de/software/bamboo) was evaluated.
Bamboo was not chosen because (unlike Jenkins) it lacked integration with metric analyses such as
Checkstyle.

Therefore, in my role as a solo entrepreneur, I decided to create, distribute, and support
add-ons for Atlassian Bamboo Server.
I started with creating an addon for integrating
[Checkstyle](https://en.wikipedia.org/wiki/Checkstyle) seamlessly into Bamboo as an MVP.
When the first sales confirmed my intention, I expanded the portfolio with add-ons for PMD, CPD and
FindBugs, and later with add-on bundles.

My Bamboo add-ons were ultimately used worldwide and helped companies with quality assurance for
their source code. At its peak, there were a total of 83 customers, ranging from small businesses to
large customers with several dozen Bamboo slave servers.

From a technological point of view, it was necessary to understand the output of all tools such as
Checkstyle and to process this as part of the Bamboo build and integrate it seamlessly into the
build view to realize the Bamboo add-ons. I also acquired in-depth knowledge of the
Atlassian Bamboo SDK for this.

**Key Achievements:**

- Developed and maintained Java-based add-ons for Checkstyle, PMD, CPD, FindBugs integration
- Built sustainable business with global customer base
- Maintained 7+ years of product reliability and customer satisfaction

**Technologies:** Java, Atlassian SDK, OSGi, Maven, JUnit, Bamboo API

**Link:** https://marketplace.atlassian.com/vendors/1213259

### January 2020 — March 2020: Cloud Consultant at Sedo GmbH

*Domain Trading Platform | Freelance | Cologne*

**Key Contributions:**

- Consolidated Spring Boot and Apache Camel services into single Quarkus service
- Standardized REST API implementations
- Evaluated Knative for serverless architecture
- Led contract testing workshops (Pact)

**Impact:** Reduced complexity, improved efficiency, enhanced testing practices

**Technologies:** Kubernetes, Knative, Quarkus, Java 11, Pact, Docker, Microservices

---

### August 2018 — October 2019: Cloud Consultant at Trusted Shops

*[Trusted Shops](https://www.trustedshops.com) | Freelance | Cologne*

**Context:** E-commerce trust provider requiring modernization of legacy systems and cloud-native
transformation

**Technical Challenges:**

- **Legacy modernization:** Migration from JavaEE6 monolith to cloud-native architecture
- **Integration complexity:** Implementing seamless integration with Salesforce and Zuora for
  subscription management
- **AWS adoption:** Designing and implementing cloud-native solutions leveraging AWS services
- **Quality assurance:** Establishing contract testing practices across microservices

**Phase 1: Subscription Team (August 2018 — April 2019)**

- Led migration from JavaEE6 monolith to modern cloud architecture
- Implemented Salesforce/Zuora integration for subscription management
- Replaced monolith functionality with AWS cloud services
- Built microservices using Micronaut and Spring Boot frameworks

**Phase 2: MARS Unit (May 2019 — October 2019)**

- Developed cloud-native solutions leveraging AWS services
- Designed architecture for new AWS-based services
- Built and deployed microservices on AWS EKS
- Led contract testing implementation using Pact across teams

**Key Contributions:**

- Successfully migrated critical business functionality from monolith to cloud
- Established cloud-native patterns and practices for future development
- Implemented comprehensive contract testing strategy ensuring service reliability
- Designed scalable AWS architectures supporting business growth

**Impact:**

- **Reduced technical debt** by modernizing legacy JavaEE6 systems
- **Improved scalability** through microservices architecture on AWS
- **Enhanced reliability** with contract testing preventing integration issues
- **Accelerated development** by establishing cloud-native CI/CD pipelines

**Technologies:** AWS (EKS, API Gateway, Lambda, S3, SQS), Java, Spring Boot, Micronaut, Pact,
Terraform, Docker

**Frameworks & Tools:**

- **Java:** Spring Boot, Micronaut (lightweight microservices)
- **Cloud:** AWS Lambda (serverless), EKS (Kubernetes), API Gateway
- **Integration:** Salesforce, Zuora (subscription management)
- **Testing:** Pact (contract testing), JUnit
- **CI/CD:** Terraform (infrastructure as code), Docker

### November 2017 — March 2018: Senior JavaEE Developer, Allianz Global Digital Factory

*via SinnerSchrader Deutschland GmbH*

- Developed JavaEE applications for Allianz digital initiatives
- Built applications for CloudFoundry platform (AWS-hosted)
- Implemented REST/HATEOAS APIs with comprehensive documentation
- **Tech:** Java, Spring Boot, CloudFoundry, REST/HATEOAS, MySQL, Redis

### October 2016 — September 2017: Senior Engineer & DevOp, toom Baumarkt GmbH

*via tarent solutions GmbH*

- Developed microservices using Java and Golang
- Implemented containerization and DevOps practices
- Built REST APIs with OAuth2 and comprehensive testing
- **Tech:** Java, Golang, Docker, Microservices, Kafka, Pact
- **References:** Technical and organizational recommendations available

---

### January 2014 — August 2016: Early Freelancing Projects

*Multiple Short-Term Contracts*

- **July — August 2016, YOOCHOOSE GmbH:** Spring applications, Jenkins CI, AWS operations
- **January — May 2016, Xsite GmbH:** REST API development with Java, Tomcat, and Groovy, Continuous
  Integration using Jenkins pipeline-as-code
- **February — June 2015 freshcells systems:** Jenkins CI with Docker, PHP quality standards
- **May 2015, fotocommunity GmbH:** Atlassian Bamboo CI implementation at fotocommunity GmbH
- **December July 2015, Silver Tours GmbH:** Infrastructure modernization for car rental platform
- **September 2014, AffiliCon GmbH:** Jenkins infrastructure setup at AffiliCon GmbH
- **January August 2014, dailypresent GmbH:** PHP backend development, AWS and Facebook integration

### August 2007 — June 2014: PHP Developer and Head of Development

*wer-kennt-wen.de / lemonline media ltd | Permanent Position*

**Career Path:**

- PHP Developer (2007-2008, 2010-2014)
- Head of Development (2008-2010)

**Key Contributions:**

- Led transformation from legacy PHP to modern OOP architecture
- Implemented scaling solutions for high-traffic social network
- Established CI/CD practices and quality testing
- Managed engineering team as Head of Development

**Tech:** PHP, Zend Framework, Jenkins, REST API, PHPUnit

---

## Personal Projects

### January 2025 - May 2025: AI support for my tax software

To simplify my tax return, I developed a CLI application that automatically captured
documents using Azure Document Intelligence and entered them into the document manager of
my [SteuerSparErklärung](https://www.steuertipps.de) tax software.

- **Tech:** Golang, Azure Document Intelligence, SqLite

https://github.com/SchulteDev/Sse-BelMngr-Hermine

### April 2018 — July 2018: Jenkins ↔ GitHub Integration PoC

- Developed integration for automatic Jenkins setup for GitHub repositories
- Implemented webhooks for automated builds and multi-tenant architecture
- **Tech:** Google Cloud, Firebase, Jenkins, Java, TypeScript, Golang

### January 2015 — July 2015: Crypto-Arbitrage Trading Bot

- Built automated trading algorithms for Bitcoin arbitrage
- Implemented machine learning with Weka and LibSVM
- **Tech:** Java, xChange API, Weka, MySQL, JUnit

## Education

### 2004-2012: Diploma in Computer Science, University of Koblenz-Landau

- **Degree:** [Diplom](https://en.wikipedia.org/wiki/Diplom) in Computer Science (equivalent to a
  Master of Science)
- **Focus:** Computer Visualistics and Software Engineering
- **Key Areas:** Software architecture, web technologies, algorithms, database systems,
  Human-Computer Interaction

### 2003: Abitur (German high school diploma)

I attended high school at the Gymnasium in Haren (Ems, DE). I was more interested in technical
subjects and took math and physics as advanced courses in high school.

I had my first contact with IT during my school years. In the sixth grade, I attended a typing
course. Unfortunately, this was my last contact with PCs at school. Later, in the years 2000-2003, I
taught myself PHP using a PHP reference. Equipped with this knowledge, I created homepages including
a forum for my friend group and later for my graduating class.

Typically, I also discovered computer games for myself. This led to my decision to study Computer
Visualistics in Koblenz.

## Technical Expertise

### Core Competencies

- **Languages:** Java (15+ yrs), Golang (5+ yrs), PHP (8+ yrs), TypeScript/JavaScript
- **Cloud Platforms:** AWS, Azure, GCP
- **Architecture:** Microservices, Event-Driven, Self-Contained Systems (SCS)
- **DevOps:** Docker, Kubernetes, CI/CD (Jenkins, Bamboo, GitLab CI)

### Technical Stack

- **Backend:** Spring Boot, Quarkus, Micronaut, JavaEE
- **Infrastructure:** Terraform, Helm, Kubernetes
- **Databases:** PostgreSQL, MySQL, Redis
- **Testing:** JUnit, Mockito, Pact (Contract Testing)
- **Integration:** REST APIs, OAuth2, Kafka, SQS
- **Monitoring:** ELK Stack, Grafana

### Specialized Knowledge

- Contract testing methodologies
- Cloud-native application design
- Developer tooling and automation
- Code quality metrics and analysis

### Certifications

- StackOverflow: [4000+ reputation points](https://stackoverflow.com/users/1645517/markus-schulte)
- GitHub contributions: https://github.com/SchulteMarkus
- Java SE 8 TechCheck: 93/100 score (2018)

## Career Breaks

### April 2020 — September 2021: Parental Leave

*During COVID-19 pandemic*

### August 2015 — December 2015: Sabbatical

*Transition to freelance consulting*

### August 2003 — March 2004: Military Service

After leaving school, it seemed opportune for me to do my
[mandatory military service](https://en.wikipedia.org/wiki/Conscription_in_Germany) straight
away so that I wouldn't be interrupted during my planned studies.
I was assigned to the air force because of my academic achievements.
I completed my basic military training at the
[Nassau-Dietz-Barracks](https://de.wikipedia.org/wiki/Nassau-Dietz-Kaserne)
close to Budel (NL), after which I was transferred to
[Hopsten airbase](https://en.wikipedia.org/wiki/Rheine-Hopsten_Air_Base) near Rheine (DE).
