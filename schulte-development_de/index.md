---
layout: page
css: /assets/index.css
---

# About me

**Cloud Architect & Software Engineer** with 18+ years experience (11+ freelance) specializing in
enterprise modernization and cloud-native transformations. Currently serving as Cloud Architect at
LBBW, contributing to "Phoenix" IT modernization for Germany's major state bank.

**Core Expertise:**

- **Enterprise Architecture:** Legacy-to-cloud migrations, experience with AWS, Azure and GCP,
  cloud strategies, cloud (native) system design
- **Technical Leadership:** Led teams of 5-9 developers, served as Product Owner and technical
  mentor
- **Backend Engineering:** Java (18y), Golang (4y), TypeScript - from monoliths to microservices
- **Cloud-Native Design:** Event-driven architecture, Self-contained Systems (SCS), distributed
  systems
- **DevOps Excellence:** Infrastructure-as-Code, automated CI/CD, comprehensive testing strategies

**My slogan:** "Crafting solutions that thrive today and tomorrow"

## My values

I have come to the conclusion that only consistent **clean IT architecture and development** leads
to success.
Hereby I am guided by the values of
[Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html).

I think the collaboration and the human components are just as important as the technical ones.
The sooner the right people have the right responsibilities, the better a product will succeed.
It is impressive how much a **good team** can achieve.

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