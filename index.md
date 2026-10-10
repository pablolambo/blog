---
title: Paweł Frankowski
layout: default
---
<section class="hero" aria-label="Introduction">
  <p class="prompt"><span class="ps1">$</span> <span data-type="whoami"></span><span class="cursor" aria-hidden="true"></span></p>
  <div class="reveal">
    <h1>Paweł Frankowski</h1>
    <p>A blog about me and the things I find interesting.</p>
    <ul class="links">
      <li><a href="{{ site.github_url }}" rel="me noopener" target="_blank">github</a></li>
      <li><a href="{{ site.linkedin_url }}" rel="me noopener" target="_blank">linkedin</a></li>
    </ul>
  </div>
</section>

<h2 class="section-title"><span class="ps1">$</span> ls posts/</h2>
<ul class="post-list">
  {% for post in site.posts %}
  <li>
    <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d" }}</time>
    <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
  </li>
  {% endfor %}
</ul>
