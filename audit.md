# rocketrez.com: a full audit of the live site

Prepared November 6, 2026 for the RocketRez team. Everything here is about the site as it is live today at https://www.rocketrez.com.

How it was done: a page-by-page capture of the live site on November 5 (copy, headings, images, status codes), fresh browser measurements on November 6 (29 pages at 1440px and 390px wide, plus throttled mobile timing on 5 pages), Semrush data pulled November 6 (US database), six buyer-style questions run through an AI answer engine, 22 public Capterra and Software Advice reviews of RocketRez, and a scan of 12 competitor sites. Measurements made on November 6 are marked with that date. Screenshots referenced below are in `strategy/audit-shots/`.

## Summary

RocketRez has the right idea and is hiding it. The homepage picks a fight nobody else in the category is picking ("The revenue platform for attractions."), and the best line on the site, "operators who treat per-cap like a scoreboard", is a real point of view. What holds it back is missing proof, low visibility in search and AI answers, and one long form at the end of every path, in that order of cost:

1. **There is almost no proof where buyers decide.** The homepage carries zero numbers, the section titled "Real Customers, Real Results." has no results in it, and the only hard result RocketRez owns (Fossil Rim: 65% more business with 55% less staffing) sits deep in one case study. A buyer comparing RocketRez to ROLLER sees "3,500+ venues" on one side and nothing on the other.
2. **Search engines and AI assistants can't find RocketRez for the things it sells.** RocketRez gets about 814 organic visits a month in the US, against 4,690 for ROLLER and 1,253 for Gateway. It is missing from the top 10 for "attraction ticketing software", "zoo management software" and "museum ticketing software", and from all six AI answers we tested. Five industry pages linked in the footer, including Museums, return "Page Not Found".
3. **Every path ends in the same long form, with no price signal.** Pricing has no number, the demo form asks for nine required fields including phone and revenue, and there is no way to see the product without talking to sales.

The good news: most of the fixes are copy, structure and housekeeping, not a rebuild of the product story. The raw material (former operators, real product screens, honest customer voices, a large content library) is already there.

## Scorecard

| Area | Grade | The one-line reason |
|---|---|---|
| Positioning and messaging | Mixed | A distinctive category line, but it never says who it's for, what it replaces, or why to believe it |
| Information architecture and navigation | Weak | 18 product pages grouped in ways buyers wouldn't guess, 5 dead industry links, 4 overlapping content homes |
| Conversion paths | Weak | One 9-field form for every intent, seven names for one CTA, no price signal, no self-serve look at the product |
| Proof and trust | Weak | Zero homepage numbers, one hard result in 15 case studies, reviews stale since mid 2024, no security page |
| Product depiction | Mixed | Real product screens (a strength), used small, repeated, and unreadable in the hero |
| Visual design and brand consistency | Mixed | Clean and consistent on the surface; generic B2B template, typos in key lines, an About page that tells a different story |
| Content and Learn | Mixed | A big library (146 posts, a podcast, an Academy) with no clear home, self-competing posts and gated definitions |
| SEO | Weak | Small footprint, inconsistent titles, 404s, test pages in the sitemap, no venue pages built for how buyers search |
| AEO / GEO | Weak | Absent from every AI answer tested; good structured data foundations undercut by broken and conflicting entity facts |
| Accessibility and performance | Mixed | No missing alt attributes and near-zero layout shift; 3 to 5 MB pages, a 4.4 s main image paint on mobile, low-contrast labels |
| Mobile | Mixed | No sideways scroll on any page; the demo form starts 1.6 screens down and some tap targets are small |

## 1. Positioning and messaging

| What we saw | Why it costs them | What good looks like |
|---|---|---|
| Homepage H1 "The revenue platform for attractions." with the sub "Most attraction software helps you run the day. RocketRez helps you earn from it . Tickets, food, retail..." (note the stray space before the period, visible in `live-home-1440-fold.png`). "Attractions" is the only audience word. The contact form lists 27 attraction types; the hero names none. | A zoo director, a ferry operator and a waterpark GM each have to guess whether this is for them. Ehrenberg-Bass's category entry point research (marketing canon, `mental-availability-and-ceps.md`) says brands get recalled through the buyer's own situation ("software for our zoo"), not a category abstraction. | Keep the revenue fight. Name who it's for and what it replaces in the first two lines: venue types, and "the separate booking, POS and membership systems you run today". |
| The market is described five different ways: About copy says "mid-market tours and attractions"; the About title tag says "Ticketing Software for Enterprise Attractions"; the Organization schema says "mid-to-large attractions operators"; `llms.txt` says "annual revenues typically between $1M and $200M"; the CEO told BetaKit in 2023 "$2M to $100M". (Measured November 6; fact-base.md for the 2023 quote.) | A buyer, and an AI engine, can't tell whether a $4M independent zoo is the core customer or an afterthought. Inconsistency reads as uncertainty. | One sentence for who RocketRez serves, used word for word in copy, titles, schema, `llms.txt`, LinkedIn and Capterra. |
| The page title says "Attractions Ticketing Software"; the H1 says "revenue platform"; `/home-variant` (live and in the sitemap) says "Wrestling with attraction software? It doesn't have to be this hard."; About says "world class ticketing and operations software, analytics on digital interactions with your guests, and personalization tools". | Four value propositions. A visitor from Google arrives expecting ticketing software and meets a different promise. | One message, carried from search result to H1 to About. |
| The strongest line on the site, "The system of record for operators who treat per-cap like a scoreboard.", is a section subtitle below the fold. No competitor names per-cap in an H1 or sub (competitors.md, section 14). | RocketRez's most ownable idea is the one fewest visitors see. Per-cap is also how operators already keep score, so it's a phrase buyers recognise. | Make per-cap the visible, repeated idea: in the sub, in the proof, in a definition page RocketRez owns. |
| Category words everyone uses: "seamless", "all-in-one", "world class", "Revolutionize", "unforgettable", "magical and memorable moments" (footer, every page). These words appear on 204 lines of the November 5 copy capture. The Relay page H1 is "Revolutionize Guest Connections with RocketRez Relay". | At least six of twelve competitors claim "all-in-one" (competitors.md, section 15). These words make RocketRez sound like everyone else and say nothing a buyer can check. | Plain operator language, which RocketRez already writes well on its vertical pages ("Slow Ride Entry", "Manual Season Pass Renewals"). |
| "The Only Attractions Platform With Built-In AI Guest Communication" (homepage H2). Convious and Peek Pro now market "AI-powered operating system" positioning (competitors.md). | "Only" is a claim a competitor's rep can dispute in one call, and buyers are wary of AI claims without proof. | Lead with what Relay does for revenue (the add-on sold by text before arrival) and the customer result, not the superlative. |
| Typos in the page source, not a font artifact: "PowerBl" (lowercase L), "Al-powered", "Al Guest Communication" appear in the homepage HTML (checked November 6). | Small, but they sit in the product's headline claims, and AI engines read the text as written. | A copy pass on headline strings. |

## 2. Information architecture and navigation

| What we saw | Why it costs them | What good looks like |
|---|---|---|
| The Platform menu groups 18 product pages under four headings (`live-nav-platform-menu-1440.png`): Dynamic Pricing and Customizable Checkout sit under "Marketing"; OTAs & Resellers, Omnichannel Sales and Payments sit under "Guest Experience". Omnichannel Sales, OTAs & Resellers and Ticketing all describe selling across channels. | A CFO looking for pricing controls, or an ops lead looking for OTA connections, won't look where they are filed. NN/g's IA guidance (UX canon, `nngroup-core.md`) is to group by how users think, tested with a card sort. | Group by the buyer's job (selling, serving on site, keeping members, reporting) and by venue type. Fold the three channel pages into one. |
| Five industry links in the homepage footer return HTTP 404 on November 6: Museums, Scenic Railways, Wildlife Parks, Race Car Experiences, Towers and Observatories (`live-museums-404-1440.png`). | Museums is a vertical with real customers (Mennonite Heritage Village, Audain Art Museum) and real search demand ("museum ticketing software", 170 searches a month at a $19 CPC). Those buyers hit a dead end. | Build the missing pages or remove the links today; redirect anything already indexed. |
| Industries live under "Solutions", while the podcast gets its own top-level nav slot ("Signal Podcast"). | The way most buyers self-identify (by venue type) is one click deeper than a podcast. | Venue types at the top level; content under one Learn heading. |
| Duplicate and stray paths: Stripe has two live pages with different titles (`/stripe` and `/integrations/stripe`); the same holds for PayPal, Rezdy, Affirm and Spotlio (audit.md). "Partners Program" links to the integrations directory. Careers leaves the site. No customer log-in in the header. | Split ranking signals, and existing customers have no obvious front door. | One URL per integration; a "Log in" link in the header. |
| Four overlapping content homes: blog, Academy, Signal podcast, Resources hub, plus ebooks on a separate domain (pages.rocketrez.com). | A buyer with a question can't tell where the answer lives. | One Learn hub with search, organised by topic. |

## 3. Conversion paths

| What we saw | Why it costs them | What good looks like |
|---|---|---|
| The same demo form is embedded on every page measured (29 of 29). Nine required fields: first name, last name, email, company, phone, role (11 options), type of attraction (27 options), annual revenue (6 options), country; plus reCAPTCHA. One option reads "Resort (No ICP included)", an internal note visible to buyers. (November 6; `live-demo-form-1440-full.png`.) | NN/g's B2B guidance is 3 to 5 fields; HubSpot's 40,000-page analysis cited by Baymard found multiple dropdowns pull conversion down (UX canon, `b2b-saas-and-complex-apps.md` and `baymard-forms-and-conversion.md`). This form has four dropdowns and a required phone number. | Ask only what sales acts on; enrich the rest from the email domain. Say what happens next and how fast. Remove the internal label. |
| Seven names for one action: "Schedule a Demo", "Schedule Demo", "Book a demo", "Contact Sales", "Consult Solutions Team", "See how it works for your zoo", "Explore Ticketing" (audit.md). | Each label sets a different expectation about what clicking leads to. | One primary action, named the same everywhere, plus one lower-commitment option. |
| `/pricing` (visible headline "Pricing Tailored for Every Tour and Attraction") has no figure, range or example. It promises "Complete transparency on all costs" and its only button is "Contact Sales" (`live-pricing-1440-fold.png`). Capterra lists "Starting price US$15,000.00, usage based, per year", which RocketRez doesn't publish. | NN/g: cost is the information B2B visitors rank highest, and hidden pricing "reads as evasive". The buyers who most need reassurance (CFOs, boards) leave with nothing to compare. Pricing transparency is open ground: no competitor makes it the point (competitors.md, section 14). | A price signal: a starting point, a sample quote, or what drives cost. Contract length, renewal and data export answered on the page. |
| No way to see the product without a call: no video tour on the homepage, no interactive demo. A demo store exists at `/demo/zoo` (in the sitemap, title "RocketRez", 9.6 MB, not linked from navigation). The Relay ROI calculator, a good lead tool, is buried under Resources. | NN/g: let hesitant buyers see the product without IT approval. Evaluators at the shortlist stage want to look before they talk. | A short product tour on the homepage and vertical pages; the calculator linked where Relay is pitched. |

## 4. Proof and trust

| What we saw | Why it costs them | What good looks like |
|---|---|---|
| The homepage has no customer count, no outcome number and no rating (fact-base.md section 7; rechecked November 6: no "Fossil Rim", "65%" or "Capterra" on the page). "Trusted by the world's leading tours and attractions" has no number. | The status quo wins about half of B2B deals when buyers can't prove the switch is safe (Dunford, cited in STRATEGY.md). ROLLER leads with "3,500+" in its H1, FareHarbor with "20,000 companies". | A proof strip near the top: customers or venues served, guests or tickets processed, one named outcome. |
| "Real Customers, Real Results." holds three quotes about partnership and support, none with a result, and one of the three is from a marketing agency (H Two Marketing), not an operator (`live-home-1440-proof-section.png`). | The heading promises results the section doesn't deliver, which weakens trust in the claim itself. | Quotes with a before/after, from operators, matched to the venue type on the page. |
| 15 case studies with one hard result between them: Fossil Rim, "65% more business with a 55% reduction in staffing" (since May 2020). The case studies hub promises "increase revenue, reduce costs, save time" and its cards carry no numbers (`live-case-studies-1440-fold.png`). The only named-competitor comparison on the site ("inventory management is much better than Centaman") is buried in that same story. | Buyers shortlist on outcomes they can repeat to a board. NN/g: each case study needs a real before/after a champion can paste. | A results box on every story; the strongest two numbers on the homepage; "switched from" lines where they're on record. |
| Capterra: 4.4 from 22 reviews, nothing newer than mid 2024. G2: too few reviews to rate. The Capterra "Best Ease of Use" badge appears only on `/get-started`, year not stated (fact-base.md section 9). ROLLER has about 150 reviews with 2025 to 2026 dates. | Directories feed almost every AI answer we tested (section 9 below), and buyers read the reviews whether RocketRez links them or not. The dominant complaint in the 2024 reviews is reporting ("reporting is well below average for the industry"). | A fresh review drive, and a page that names the reporting complaint and shows what changed (Insights launched September 2024). |
| No security, uptime or compliance page. The only statement is a theme parks FAQ line: "PCI-compliant and includes user permissions, audit logs, and secure payment processing" (fact-base.md section 11). | IT and procurement are part of every committee (Reunion Tower's IT Manager is a quoted reference). Silence reads as risk. | A plain security page: PCI scope, hosting, access controls, data ownership and export, what's available on request. |
| Strengths not used: US$15M Series B (2023), investor logos on About only, "former operators" said by customers unprompted (Gulf Islands: "a crew of former operators"). | Credibility RocketRez already has isn't working for it. | A short credibility line; the former-operator story told with names and faces. |

## 5. Product depiction

| What we saw | Why it costs them | What good looks like |
|---|---|---|
| The homepage hero is a family-at-kiosk photo with floating product cards whose text is unreadable at 1440px and at 390px (`live-home-1440-fold.png`, `live-home-390-fold.png`). | The product reads as decoration, and the picture doesn't support "revenue". | One readable screen showing a sale adding up, at a size you can read. |
| The Ticketing page hero shows a screen titled "Point of Sale" (`live-ticketing-1440-fold.png`); the same POS screen also appears in the homepage hero. Screens carry 2024 dates. | Visitors who click deeper see the same picture again, and the Ticketing page never shows a ticket being bought. | The right screen on each page, showing that module doing its job. |
| Platform pages follow one pattern: feature name, one sentence, icon, repeated ("Lightning-Fast Transactions", "Simple, Intuitive Interface", "Secure & Reliable" on Point of Sale; audit.md). | Feature lists don't show a workflow, so every vendor's page looks alike. | Show the job end to end: a guest buys, staff serve, the manager sees it the same day. |

## 6. Visual design and brand consistency

| What we saw | Why it costs them | What good looks like |
|---|---|---|
| Archivo throughout, primary blue #0051F9, dark hero to navy gradient, white interior pages (brand-assets.md). Consistent and tidy. The look is a generic dark-hero SaaS template; nothing visual says attractions beyond lifestyle photos. Our judgment. | Distinctive assets are how brands get remembered (marketing canon, Ehrenberg-Bass). A template look borrows the category's memory structures rather than building RocketRez's own. | One owned visual idea used everywhere, for example per-cap as a visible device. |
| About leads with a four-line blue headline ("We provide world class ticketing and operations software, analytics on digital interactions with your guests...") over a mission line in caps, and a Manhattan skyline photo for a company built in Steinbach (`live-about-1440-fold.png`). The real H1 is hidden (`class="hide"`). | About is where a board member checks who they're buying from. Right now it doesn't say "former operators from Manitoba", which is the most credible thing RocketRez has. | About tells the operator story in plain words, with the team and the place. |
| The blog header reads "Get tips and advice on delivering exceptional customer service, engaging and delighting your customers, and building a customer-centric company." (`live-blog-1440-fold.png`). | Nothing in it is about attractions; it could be any company's blog. | A header that says who the blog is for and what it helps them do. |
| Icons mix filled and outline styles across the nav and vertical sets (audit.md, judgment). Three hover colours on Ticketing feature labels (green, yellow, coral) fall well below contrast minimums (section 10). | Small inconsistencies add up to "unfinished". | One icon style; colour used for meaning, not decoration. |

## 7. Content and Learn

| What we saw | Why it costs them | What good looks like |
|---|---|---|
| 146 blog posts, 18 categories and 44 tag pages, all in the sitemap. A post-by-post review (`research/seo/blog-actions.csv`) found 26 posts that should merge, 4 that should become chapters of pillar guides, 20 that duplicate product or customer pages, 10 to retire (including 2020 release notes) and 12 worth refreshing. | Posts compete with each other (five holiday posts, three membership posts) and with RocketRez's own product pages: `/waterparks` ranks #55 for "water park ticketing software" while a blog post ranks #4 (Semrush, November 6). | Fewer, deeper guides; each linked to the vertical or product page it supports. |
| The glossary, buyer guides and playbooks (9 ebooks) are gated on a separate domain, pages.rocketrez.com. | NN/g: gate only high-value, late-stage material. Definitions are exactly what AI engines quote (section 9), and a gated PDF can't be quoted. | Ungate the glossary as web pages; keep a short form for the deep guides. |
| Signal has 8+ episodes with long transcripts; the player is an untitled iframe (November 6). The Academy has 7 learning paths. | Some of the most expert material RocketRez owns is invisible to search and to screen readers. | Takeaways above each transcript; one Learn hub tying blog, Academy and Signal together. |

## 8. SEO

| What we saw | Why it costs them | What good looks like |
|---|---|---|
| Footprint (Semrush, US, November 6): 393 ranking keywords and about 814 visits a month. ROLLER 4,690, FareHarbor 18,727, Gateway 1,253. Brand demand is healthy ("rocketrez" plus "rocket rez" = 740 searches a month); category searches are where RocketRez loses. | The money searches are small but expensive: "museum ticketing software" 170 a month at $19.35 CPC, "tour booking system" 140 at $25.37. Together the category and venue terms come to about 3,800 searches a month (strategy/SEO-AEO.md). | Win the category and venue searches buyers actually type. |
| Gateway holds #1 for "attraction ticketing software", "museum ticketing software" and "theme park ticketing system" with one plain page per venue type, the exact phrase in the title and URL. Centaman does the same for "zoo management software". RocketRez isn't in the top 10 for any of the three SERPs checked. | The pattern that wins is simple and RocketRez already has most of the pages. | Venue page titles that use the searched phrase ("Zoo ticketing, POS and membership software"), keeping the creative H1. |
| Titles are inconsistent (November 6): "Zoos Ticketing Solution - RocketRez", "Waterparks Ticketing Solution \| RocketRez", "Aquariums Ticketing Software - RocketRez"; Relay's title is 70 characters; descriptions run to 221 (Boat Tours) and 190 (Theme Parks) characters and will be cut off. Platform H1s are bare module names ("Point of Sale", "Dynamic Pricing"). | Truncated or vague snippets lose the click even when the page ranks. | One title pattern, search term first, under 60 characters; descriptions under 155. |
| The sitemap lists 367 URLs (November 6), including `/home-variant` (title "Home"), `/demo/zoo` (title "RocketRez", no description), 44 tag pages and five account pages (access-denied, reset-password, update-password, user-account, sign-up). robots.txt blocks `/user-account` while the sitemap submits it. | Test and utility pages dilute the site and contradict the brand story in search results. | A sitemap of real pages only; noindex on test and account pages. |
| Two pages hold almost all non-brand rankings: `/platform/dynamic-pricing` (#1 to #2 for "best dynamic pricing tools for attraction tickets") and `/blog/waterpark-ticketing-software-features` (#1 to #8 across nine waterpark terms). Some traffic is off target ("venmo pay later", "relay company pricing model"). | Any future URL change that drops these without redirects wipes out most non-brand search traffic. A full 274-URL redirect map is in `research/seo/redirect-map.csv`. | Protect these two pages; build the venue pages around the waterpark post's success. |

## 9. AEO and GEO (how RocketRez shows up in answer engines)

Method note: six buyer questions run through an AI answer engine with web search, plus Semrush SERPs (November 6). A live ChatGPT, Perplexity and Google AI Mode sweep was not run, so "absent" means absent in these answers.

| What we saw | Why it costs them | What good looks like |
|---|---|---|
| RocketRez was named in none of the six answers: best zoo and aquarium ticketing software, ROLLER alternatives, best waterpark and season pass software, best boat tour booking software, Tessitura or Altru alternatives, and "what is per cap spending". It appeared once, only as a Blooloop source link (aeo-evidence-2026-11-06.md). | Buyers increasingly start a shortlist by asking an assistant. Not being named means not being considered. | Be present in the sources engines lean on, with clear, consistent facts. |
| The answers leaned on Capterra, G2, GetApp and Software Advice, on listicle sites (Gitnux, Krowdbase, Fitgap) and on comparison pages competitors wrote themselves (Beyonk's "Roller software alternative"). | With 22 reviews and none since mid 2024, RocketRez doesn't clear the bar these sources set. | Fresh reviews, correct directory categories, and honest comparison and "how to choose" content. |
| Per-cap is RocketRez's own positioning metric, yet the answer to "what is per cap spending" is led by an attractions.io article. RocketRez's glossary is gated. | RocketRez is ceding the definition of its own idea. "per cap" draws 390 searches a month. | An ungated, plainly written definition of per-cap and the terms around it. |
| Good foundations (November 6): an Organization schema on every page; SoftwareApplication and FAQPage schema on vertical and platform pages; an `llms.txt` file. Credit where due: many sites have none of this. | These are the right instincts. | Keep them, and make them accurate (next row). |
| `llms.txt` lists 11 industries; 6 of those links return 404 (Museums, Scenic Railways, Wildlife Parks, Towers and Observatories, Race Car Experiences, Immersive Experiences). It claims boat tours board "500+ guests in 10 minutes", a figure that appears nowhere else on the site, while the case study is titled "200 Guests in 15 Mins". It also uses "all-in-one". The homepage has no SoftwareApplication schema. | The file written specifically for AI engines sends them to dead pages and a number that conflicts with RocketRez's own proof. | Every fact in `llms.txt` and schema should match a live page. |
| The zoo FAQ schema answers "What is the best ticketing system for zoos?" with "RocketRez stands out as a top zoo ticketing solution". | Engines and buyers discount self-ranking. A plain, factual answer is more likely to be quoted. | Answers that define, compare honestly and cite a customer. |
| Founding year differs by source: 2011 (BetaKit) and 2012 (AiThority); the site gives none (fact-base.md section 1). | Entity facts that disagree make engines less confident about who RocketRez is. | One set of company facts (founded, HQ, CEO, what it does) on About, in schema, and on LinkedIn, Crunchbase and Capterra. |

## 10. Accessibility and performance

All figures measured November 6 in headless Chromium. Throttled runs use Lighthouse's mobile settings (150 ms latency, 1.6 Mbps, 4x CPU slowdown); these are lab numbers, not field data.

| What we saw | Why it costs them | What good looks like |
|---|---|---|
| Throttled mobile Largest Contentful Paint: homepage 4.4 s (the hero image), Case Studies 3.0 s, Zoos 2.4 s, Pricing 1.0 s. Layout shift is close to zero on most pages (worst: Academy 0.085). | Google's "good" threshold for LCP is 2.5 s; above 4.0 s is "poor". The homepage is the page paid and brand traffic lands on. | Preload and right-size the hero image; defer what isn't needed for the first screen. |
| Page weight is 2.8 to 5.1 MB on 22 of the 24 working pages measured; Case Studies is 8.0 MB (4.5 MB of images) and `/demo/zoo` 9.6 MB. On the homepage, scripts are 1.9 MB of 3.1 MB, fonts 670 KB, images only 392 KB, across 33 hosts (Google Tag Manager 530 KB, Facebook 277 KB, HubSpot forms 197 KB). | The weight is mostly tracking and form scripts loaded on every page, which slows phones on park Wi-Fi and conference networks. | Load the form and tags only where needed; trim font files; compress case-study thumbnails. |
| Low-contrast text (WCAG 2.2 AA needs 4.5:1 for body text): Ticketing feature labels "Dynamic Pricing Made Easy" at 1.54:1 and "On-Site Tools for Fast Sales" at 1.45:1; Features index tabs at 2.28:1; Newsroom dates at 2.85:1; the Relay calculator footnote at 3.95:1. | Hard to read for anyone with low vision or in bright light; a basic accessibility failure (UX canon, `accessibility-and-content-design.md`). | Darken label colours; keep accent colours for shapes, not small text. |
| Every page puts 11 menu headings ("Operations", "Reporting", "Marketing" and so on) before the H1. About's only H1 is hidden. Case Studies and Newsroom skip from H1 to H3. The Signal player iframe has no title. | Screen reader users navigate by headings; they hear the menu before the page. | Menu labels as plain text, not headings; one visible H1 per page; titled embeds. |
| No image is missing an alt attribute (29 pages, November 6), and product images carry descriptive alt text (audit.md). | A real strength. | Keep it. |

## 11. Mobile

| What we saw | Why it costs them | What good looks like |
|---|---|---|
| No page scrolls sideways at 390px (29 of 29, November 6). The hero and CTA fit the first screen (`live-home-390-fold.png`). | A solid base. | Keep it. |
| On `/get-started` at 390px the form starts 1,343px down a 4,986px page (about 1.6 screens) and is 1,146px tall (`live-demo-form-390-full.png`). | The page whose only job is the form makes mobile visitors scroll past content to reach it, then fill nine fields on a phone. | Form first on mobile, with fewer fields. |
| Small tap targets (under 24px) in the first screens: 11 on the Ticketing page, 25 on Signal. | WCAG 2.2 target size (2.5.8) asks for 24 by 24px minimum. | Larger hit areas on links and pills. |

## Top 15 fixes, ranked by impact against effort

Effort: S = hours, M = days, L = weeks. Timelines count from whenever the team starts.

| # | Fix | Impact | Effort |
|---|---|---|---|
| 1 | Fix or remove the five 404 footer links and the six dead `llms.txt` links; redirect anything indexed | High | S |
| 2 | Put proof on the homepage: a customer or volume number, the Fossil Rim result, a rating | High | S |
| 3 | Cut the demo form to what sales acts on; remove "(No ICP included)"; say what happens next | High | S |
| 4 | One sentence for who RocketRez serves, used everywhere (copy, titles, schema, `llms.txt`, directories) | High | S |
| 5 | Fix the typos ("PowerBl", "Al-powered", "earn from it .") and retire "seamless", "world class", "Revolutionize" | Medium | S |
| 6 | Clean the sitemap: drop `/home-variant`, `/demo/zoo`, account pages and tag pages; noindex test pages | Medium | S |
| 7 | Retitle venue and platform pages with the searched phrase, under 60 characters; trim long descriptions | High | S |
| 8 | Add a price signal and contract, renewal and data-export answers to Pricing | High | M |
| 9 | Build the Museums and Scenic Railways pages, using existing customers and the railway posts | High | M |
| 10 | A results box on every case study and a "switched from" line where it's on record | High | M |
| 11 | A plain security and procurement page | Medium | M |
| 12 | Regroup the Platform menu by buyer job; put venue types at the top level | Medium | M |
| 13 | Lighten the homepage: hero image priority, scripts and the form loaded only where needed | Medium | M |
| 14 | A fresh Capterra and G2 review drive, and correct directory categories | High | M |
| 15 | Ungate the glossary as web pages, starting with a per-cap definition RocketRez owns | High | L |

Questions worth answering first, inside the team: How many venues, guests or tickets can RocketRez say publicly? Which founding year is right? Is "mid-market" or "mid-to-large" the target? Which customers would take a reference call?

If a hand would help with any of it, we'd be glad to talk, and we have a working concept of these fixes we're happy to walk through.
