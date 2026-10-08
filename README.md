# Tin & Michelle · 6 March 2027

One-page wedding invite with a custom RSVP form. Plain HTML, CSS and JS, no build step.
Personal project (not agency work). Design follows the couple's Canva save-the-date card.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole page: cover, the evening, RSVP, Q & A, sign-off |
| `css/style.css` | Styles. Colours and fonts are the variables at the top |
| `js/main.js` | Scroll reveals and the RSVP form logic |
| `js/config.js` | The one setting: the RSVP endpoint URL |
| `apps-script/Code.gs` | The script that saves RSVPs into a Google Sheet (it sends no email) |

## Connecting the RSVP form to a Google Sheet (about 5 minutes)

Do this signed in to the Google account that should own the guest list.

1. Create a new Google Sheet. Name it anything, e.g. "Tin & Michelle RSVPs".
2. In the Sheet: **Extensions → Apps Script**. Delete what is there and paste in all of `apps-script/Code.gs`. Save.
3. In the function dropdown pick **setup** and press **Run**. Approve the permission prompt
   (it asks to edit this spreadsheet only). The Sheet now has a `Responses` tab and a `Summary` tab.
4. **Deploy → New deployment → Web app**. Execute as: **Me**. Who has access: **Anyone**. Deploy.
5. Copy the web app URL (ends in `/exec`) and paste it between the quotes in `js/config.js`.

Until step 5 is done the form runs in preview mode: it shows the thank-you message but saves nothing,
and a small "Preview mode" note appears above the form.

If `Code.gs` is edited later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.

## What the couple sees

- `Responses` tab: one row per guest (received time, name, attending, plus-one, plus-one name, dietary, WhatsApp, email, message).
- `Summary` tab: guests attending, plus-ones, total headcount, declined, responses received. Updates by itself.
- A guest who responds again with the same email updates their row rather than adding a second one.
- No email is sent. After responding, the guest can download an RSVP confirmation card (a PNG drawn in their
  own browser from their answers, with the date and time sent).
