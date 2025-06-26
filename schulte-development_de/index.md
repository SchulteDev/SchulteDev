---
layout: page
css: /assets/index.css
---

<div class="hero-section">
  <h1>Markus Schulte: Cloud Architect & Software Engineer</h1>
  <p>
    With 18+ years of experience (11+ freelance), I specialize in enterprise modernization and cloud-native transformations.
    Currently, I serve as a Cloud Architect at LBBW, contributing to the "Phoenix" IT modernization for Germany's major state bank.
  </p>
  <p class="slogan">"Crafting solutions that thrive today and tomorrow"</p>
</div>

# About me

## Core Expertise

- **Enterprise Architecture:** Legacy-to-cloud migrations, experience with AWS, Azure and GCP,
  cloud strategies, cloud (native) system design
- **Technical Leadership:** Led teams of 5-9 developers, served as Product Owner and technical
  mentor
- **Backend Engineering:** Java (18y), Golang (4y), TypeScript - from monoliths to microservices
- **Cloud-Native Design:** Event-driven architecture, Self-contained Systems (SCS), distributed
  systems
- **DevOps Excellence:** Infrastructure-as-Code, automated CI/CD, comprehensive testing strategies

## My values

The principles of good software development and architecture are well known, with Clean Code
and Clean Architecture outlining the essentials.
In my experience, applying these **proven IT principles** leads to and ensures a healthy
IT system landscape in the long term.

I think the collaboration and the human components are just as important as the technical ones.
The sooner the right people have the right responsibilities,
the sooner a development will be successful.
It is impressive how much a **good team** can achieve.

# My Skillset

<div class="skillset-tags">
  <span class="tag">#CloudArchitecture</span>
  <span class="tag">#SoftwareEngineering</span>
  <span class="tag">#Java</span>
  <span class="tag">#Golang</span>
  <span class="tag">#TypeScript</span>
  <span class="tag">#Microservices</span>
  <span class="tag">#EventDriven</span>
  <span class="tag">#AWS</span>
  <span class="tag">#Azure</span>
  <span class="tag">#GCP</span>
  <span class="tag">#Kubernetes</span>
  <span class="tag">#Docker</span>
  <span class="tag">#Terraform</span>
  <span class="tag">#CI/CD</span>
  <span class="tag">#DevOps</span>
  <span class="tag">#CleanCode</span>
  <span class="tag">#Architecture</span>
  <span class="tag">#Agile</span>
  <span class="tag">#Leadership</span>
  <span class="tag">#ContractTesting</span>
  <span class="tag">#API_Design</span>
  <span class="tag">#Monorepo</span>
</div>

# My career

<div class="page-section">
{% for company in site.data.portfolio %}
  <div class="box">
    <a href="{{ company.url }}">
      <img src="/assets/img/logos/{{ company.img }}" alt="{{ company.title }} logo"/>
      <div class="box-title">{{ company.title }}</div>
      <div class="box-desc">{{ company.description }}</div>
    </a>
  </div>
{% endfor %}
</div>

# My services

<div class="page-section">
{% for app in site.data.services %}
  <div class="box">
    <img src="/assets/img/service-icons/{{ app.img }}"  alt="{{ app.title }} icon"/>
    <div class="box-title">{{ app.title }}</div>
    <div class="box-desc">{{ app.description }}</div>
    <div class="box-desc">{{ app.skills }}</div>
  </div>
{% endfor %}
</div>

# Contact

<div class="page-section">
  <div class="box">
    <a href="https://outlook.office365.com/owa/calendar/Schultedevelopment1@schulte-development.de/bookings/">
      <img src="/assets/img/logos/microsoft_bookings_logo.png" alt="Outlook logo"/>
      <div class="box-desc">Book appointment online</div>
    </a>
  </div>
  <div class="box">
    <a href="mailto:mail@schulte-development.de">
      <img src="/assets/img/logos/mail.png" alt="Logo of email"/>
      <div class="box-desc">mail@schulte-development.de</div>
    </a>
  </div>
  <div class="box">
    <a href="https://www.linkedin.com/in/markus-schulte">
      <img src="/assets/img/logos/linkedin.png"  alt="LinkedIn logo"/>
      <div class="box-desc">markus-schulte@LinkedIn</div>
    </a>
  </div>
</div>
