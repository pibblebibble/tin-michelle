# Tin & Michelle · 6 March 2027

One-page wedding invite with a custom RSVP form.

- **Live site:** https://pibblebibble.github.io/tin-michelle/
- **Built with:** plain HTML, CSS and JavaScript. No framework, no build step, nothing to install.
- **Hosting:** GitHub Pages, served straight from the `main` branch. **Anything pushed to `main` is live within a minute or two.**

If you are using Codex (or another AI coding assistant), it will read [AGENTS.md](AGENTS.md) for the house rules of this project.

---

## 1. How to make a change

1. **Get the files.** First time: `git clone https://github.com/pibblebibble/tin-michelle.git`. After that: `git pull` before you start, so you have the latest version.
2. **Edit.** Most text changes are in `index.html` (see the map in section 2).
3. **Preview on your own machine.** From the project folder run `npx serve .` (or `python3 -m http.server 8000`) and open the address it prints. Opening `index.html` by double-clicking mostly works too, but the dog animations need the local server.
4. **Check it** (section 5).
5. **Publish.** `git add -A`, `git commit -m "what you changed"`, `git push`. Wait a minute, then refresh the live site. If your phone still shows the old version, it is cached: pull down to refresh or open it in a private tab.

To push you need to be added as a collaborator on the repo. Ask Vivien.

---

## 2. Where everything is

| File | What it is |
|---|---|
| `index.html` | The whole page, top to bottom: cover, The evening, RSVP form, thank-you messages, Q & A, sign-off |
| `css/style.css` | All styling. Colours and fonts are the variables at the very top |
| `js/main.js` | Entrance animations, the dog, the RSVP form logic, the downloadable confirmation card |
| `js/config.js` | One setting: the address RSVPs are sent to. **Leave it alone** unless the Google Sheet is being replaced |
| `apps-script/Code.gs` | A copy of the script that runs inside the Google Sheet. Editing this file alone changes nothing (section 4) |
| `assets/fonts/` | The Seasons (everything) and Eyesome Script (the handwritten headings) |
| `assets/dog/` | The dog animations (Lottie files) |
| `assets/monogram.png` | The T♡M mark at the bottom |

---

## 3. Common edits

### Change wording
Open `index.html` and edit the text between the tags. The page is laid out in the same order as the site, with a comment above each section.

### Change the date, times, venue or RSVP deadline
These facts are repeated in several places. Change **all** of them, or the page will contradict itself.

| Fact | Where it appears |
|---|---|
| Dinner time (`7.00pm`) | `index.html`: cover, "The evening", the thank-you box, the Q & A answer on arrival. `js/main.js`: the confirmation card (search for `Dinner starts`) |
| Arrival time (`6:00–6:15pm`, `6:15pm`) | `index.html`: "The evening", the thank-you box, the Q & A answer. `js/main.js`: the confirmation card |
| Wedding date (`6 March 2027`) | `index.html`: page title and description at the top, "The evening", the thank-you box. `js/main.js`: the confirmation card (`SATURDAY, 6 MARCH 2027`). The calendar on the cover is a hand-written table, and the heart sits on the `6` |
| RSVP deadline (`30th November 2026`) | `index.html`: under "Please r.s.v.p", and the first Q & A answer |
| Venue | `index.html`: cover, "The evening" (plus the Google Maps link below it), the thank-you box. `js/main.js`: the confirmation card |

Tip: search the whole project for the old value before and after, to be sure none are left.

### Add, remove or reword a Q & A
In `index.html`, each question is one block like this. Copy, paste and edit, or delete the whole block.

```html
<details data-reveal>
  <summary>The question?</summary>
  <p>The answer.</p>
</details>
```

### Change colours or fonts
Top of `css/style.css`: `--navy` is the ink colour, `--paper` the background, `--blush` the heart. The font files are loaded just above that.

### The dog
- The head that pops up above the Q & A list: `.dog-peek` in `css/style.css` controls its size and position.
- The whole dog that appears when the heart on the 6th is tapped: `.dog-cameo` controls its size. It leaves after 9 seconds (`9000` in `js/main.js`).
- To remove either one, delete its `<div>` in `index.html` (`id="dog-peek"` or `id="dog-cameo"`).

---

## 4. The RSVP form and the Google Sheet

**How it works:** when a guest presses Send, the page posts their answers to a small script attached to a Google Sheet. The script adds one row per guest. No email is sent. After sending, the guest can download a confirmation card, which is drawn in their own browser.

**Where the guest list is:** a Google Sheet owned by Vivien's personal Google account. Ask her for access. It has two tabs:
- `Responses`: one row per guest (received time, name, attending, plus-one, plus-one name, dietary, WhatsApp, email, message). A guest who responds again with the same email updates their row instead of adding a new one.
- `Summary`: guests attending, plus-ones, total headcount, declined. It updates by itself.

### Adding or changing a form question
A form field lives in **four** places, and they must all agree:

1. `index.html`: the field itself, inside `<form id="rsvp-form">`.
2. `js/main.js`: the `payload` object (what gets sent), and `validate()` if the field is required.
3. `js/main.js`: `paintConfirmation()`, if it should appear on the confirmation card.
4. The script in the Google Sheet: the `HEADERS` list and the `row` list in `doPost`. `apps-script/Code.gs` in this repo is only a copy, so after editing it you must paste it into the Sheet (**Extensions → Apps Script**) and publish it with **Deploy → Manage deployments → Edit → Version: New version → Deploy**. Using "New version" keeps the same address, so `js/config.js` does not change. Then add the new column heading in the `Responses` tab.

If steps 1 to 3 are done without step 4, the form still works but the new answer is silently dropped.

### The planning tracker reads the same Sheet
The couple's planning tracker (a separate repo, `tin-michelle-tracker`) shows the guest list live. It asks this
script for the responses and must send a passcode. The passcode is **not** in the code: it is stored in the
Sheet's script under **Project Settings → Script properties** as `TRACKER_KEY`. To change the passcode, change
that value; everyone then re-enters it in the tracker.

### If the Sheet ever needs replacing
1. Create a new Google Sheet, open **Extensions → Apps Script**, paste in all of `apps-script/Code.gs`, save.
2. Choose the `setup` function and press **Run**. Approve the prompt (Google warns that the app is unverified: **Advanced → Go to project**).
3. **Deploy → New deployment → Web app**. Execute as: **Me**. Who has access: **Anyone**.
4. Paste the new `/exec` address into `js/config.js` and push.

If `js/config.js` is left empty, the form runs in preview mode and saves nothing.

---

## 5. Check before you push

- **Phone width first.** Almost every guest opens this from a QR code on their phone. Narrow your browser window, or use the device mode in the browser's developer tools.
- **See the thank-you state without sending an RSVP:** add `?preview=yes` or `?preview=no` to the address, for example `http://localhost:3000/?preview=yes`. Nothing is sent or saved, and the download button works with sample details.
- **Do not send test RSVPs from the real form** unless you delete the row from the Sheet afterwards. Every submission counts towards the headcount.
- Tap the heart on the 6th (the dog should appear) and scroll to the Q & A (the head should pop up).

---

## 6. Please don't

- **Rename the repo.** The address changes with it and any printed QR code stops working.
- **Change `js/config.js`** unless you are replacing the Sheet.
- **Delete or rename files in `assets/fonts/`.** The page falls back to plain system fonts.
- **Force-push or rewrite history on `main`.** It is the live site.

---

## 7. Credits and licences

- Fonts: The Seasons (My Creative Land) and Eyesome Script, supplied by the couple, used here for a personal, non-commercial wedding invite.
- Dog animation: "Happy Dog" from LottieFiles, free for personal use, edited for this page.
