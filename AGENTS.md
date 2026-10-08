# Instructions for AI coding assistants

This is a live wedding invite for Tin & Michelle (6 March 2027). Read `README.md` first: it maps
every file and lists where each fact is repeated.

## Ground rules

- **`main` is the live site.** GitHub Pages serves it directly. Never push without the user's
  explicit go-ahead, and never force-push.
- **No build step, no dependencies.** Plain HTML, CSS and JavaScript. Do not add a framework,
  bundler, package.json or npm packages. The only external script is lottie-web from cdnjs.
- **The design is approved.** Fonts, colours, layout, spacing and animations were signed off by the
  couple. Do not restyle, "tidy" or "improve" anything visual unless the user asks for that
  specific change.
- **Do not edit `js/config.js`** (the RSVP endpoint) unless the user says the Google Sheet is being
  replaced.
- **Never submit the real RSVP form while testing.** Each submission adds a guest to the couple's
  headcount. Use `?preview=yes` and `?preview=no` to see the thank-you state, or stub `fetch`.
- **Do not invent content.** Dates, times, venue details and Q & A answers come from the couple.
  If something is missing, ask.

## Things that are easy to break

- **Facts are repeated.** Dinner time, arrival time, date, venue and the RSVP deadline each appear
  in several places across `index.html` and in the confirmation card text in `js/main.js`
  (`paintConfirmation`). When one changes, search the project and change them all. The table in
  README section 3 lists them.
- **Form fields live in four places** that must agree: the field in `index.html`, the `payload`
  and `validate()` in `js/main.js`, `paintConfirmation()` in `js/main.js`, and the Apps Script
  (`HEADERS` and `row` in `apps-script/Code.gs`). The Apps Script in this repo is only a copy of
  what runs inside the Google Sheet; the user has to paste it there and redeploy as a new version.
  Tell them so whenever you touch it.
- **Hidden elements.** Several elements are toggled with the `hidden` attribute and also have a
  `display` value in CSS. If you add one, add a matching `[hidden] { display: none; }` rule, or it
  will show when it should not.
- **Scroll reveals.** Elements with `data-reveal` start invisible and are revealed by an
  IntersectionObserver. Do not put `clip-path` on the observed element itself: the script headings
  clip an inner `.write` span for this reason.
- **Script font metrics.** Eyesome Script is wide with long descenders. Headings that use it need
  the extra bottom padding they have, and the names on the cover are sized to fit one line on a
  375px-wide phone. Re-check at phone width after any change near them.

## Verifying a change

1. Serve the folder (`npx serve .` or `python3 -m http.server`) and load it at about 375px wide and
   at desktop width.
2. Check there is no horizontal scroll and the cover still fits in one screen.
3. Load `?preview=yes` and `?preview=no` and check the thank-you state and the download button.
4. Tap the heart on the 6th and scroll to the Q & A to confirm both dog animations still appear.

## Style

- British English. Match the couple's existing tone in any guest-facing text.
- Keep comments short and only where the reason is not obvious, like the existing ones.
- Commit messages: one plain sentence saying what changed.
