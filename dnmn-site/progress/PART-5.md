# Part 5: Finale and safety net: Contact, Lite site, SEO
Status: DONE
Updated: 2026-09-28

Files owned by this part: src/scenes/Contact.jsx, src/lite/LiteSite.jsx, src/components/SeoHead.jsx, public/sitemap.xml, public/robots.txt, README.md (Deploy section only)

## Checklist (tick each box with [x] when finished and tested)
- [x] Contact scene (rotating magnet, form with validation and honeypot, WhatsApp, mail, tel, footer with cities)
- [x] ContactForm exported as a named export and reused by LiteSite
- [x] LiteSite (2.5D fallback, no Three.js) with all sections
- [x] SeoHead (title, meta, Open Graph, JSON-LD)
- [x] robots.txt and sitemap.xml
- [x] README Deploy section checked
- [x] Tested with ?debug&scene=contact and ?lite
- [x] npm run build passes

## Log (append newest at the bottom: date, what you did, files touched)
- 2026-09-28: Built and wired in. npm run build passes.

## Known issues
- none yet

## Notes for the next agent
- none yet
- 2026-09-28: Contact: overlay rewritten to scroll internally (fixes content being cut off on short/laptop viewports); background changed from a bare rotating magnet to a small skyline with two lit billboards; magnet's stray cone replaced with a built-from-boxes lightning bolt.
