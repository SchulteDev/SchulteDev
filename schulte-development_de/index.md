---
layout: page
css:
  - /assets/css/index.css
---

# About me

**15+ Years; Cloud & Dev Expert; Technical Architect**

I'm a highly skilled software engineer with over 15 years of experience.
I help businesses like yours thrive by crafting cloud-based solutions, developing robust software,
and empowering your team through training and coaching.

## My career

- After leaving school, I started studying computer science at the University of Koblenz in
  **2004**, which I finished with a diploma (similar to M.Sc.) in 2012
- Parallel to my studies, I started working for
  [wer-kennt-wen.de](https://en.wikipedia.org/wiki/Werkenntwen) in **2008** as a PHP developer and
  later as head of development
- In **2014** I changed my career direction and decided to become a freelancer

## My values

I have come to the conclusion that only consistent **clean IT architecture and development** leads
to success.
Hereby I am guided by the values of
[Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html).

I think the collaboration and the human components are just as important as the technical ones.
The sooner the right people have the right responsibilities, the better a product will succeed.
It is impressive how much a **good team** can achieve.

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

# My portfolio

<div class="page-section">
{% for app in site.data.portfolio %}
  <div class="box">
    <a href="{{ app.url }}">
      <img src="/assets/img/logos/{{ app.img }}"  alt="{{ app.title }} logo"/>
      <div class="box-title">{{ app.title }}</div>
      <div class="box-desc">{{ app.description }}</div>
    </a>
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
