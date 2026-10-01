# Queer Club Directory

Created by Roneilla Bumanlag

An online directory to help queer folks find clubs, communities, and events based in Toronto.

[Follow us on instagram](https://www.instagram.com/queerclubdirectory/)

Contact us: [queerclubdirectory@gmail.com](mailto:queerclubdirectory@gmail.com)

## Tech stack

- React (Vite) + TypeScript
- TailwindCSS
- MongoDB
- Netlify

## Releases

### June 8 2024

These improvements are part of the preparation for upcoming feature of events calendar!

- Implemented MongoDB database
- Created a new in-site form for submitting data (no longer using google forms)
- Updated the navigation and headers
- Implemented a mobile navigation

## Admin access

Visit `/admin` to list, search, filter and edit submissions, then approve or reject
individual entries. Both `clubSubmissions` and legacy lowercase `clubsubmissions`
are shown. The public `/add` form writes to the existing `clubSubmissions` collection.

Generate a random private key with `openssl rand -hex 32`. Set `ADMIN_ACCESS_KEY`
in local `.env` and Netlify's Functions environment, then restart/redeploy.
Never use a `VITE_` prefix. Run `npx netlify dev` and sign in at `/admin`.
The key stays in browser memory and is cleared on refresh or sign out.

Save edits updates only the submission, including incomplete drafts. Approval
validates the fields and atomically publishes to `clubs` and marks the submission
approved using a MongoDB transaction (Atlas/replica set required). Existing clubs
are matched by linked ID, submission ID or normalized name; approving updates
those club details while preserving tags. Rejection keeps the submission for
reference and never removes an existing club. Duplicate name/Instagram constraints
remain unchanged and produce a review error without partial approval.

Run `node --test tests/*.test.mjs` for endpoint checks.

### Admin pages

- `/admin/submissions`: edit, approve and reject submitted entries.
- `/admin/directory`: the full directory with an Edit button on every card.
  The modal edits name, description, Instagram, website, category, location,
  schedule and comma-separated tags. Save updates that existing MongoDB record
  by ID and refreshes the card. Cancel discards edits after confirmation.

Both pages share the same in-memory sign-in. `/admin` opens Submissions.
Directory edits preserve unrelated record fields and do not create new clubs.

### Admin subdomain and dates

Assign `admin.queerclubdirectory.org` as a domain alias of the same Netlify site
(`queerclubdirectory`), configure its DNS using Netlify's domain instructions,
and ensure HTTPS is provisioned. Deploy this project to enable the admin host:

- `https://admin.queerclubdirectory.org/submissions`
- `https://admin.queerclubdirectory.org/directory`

The admin host uses the existing server-side key and Functions; it does not show
the public navigation. Production `/admin` paths redirect to the admin host.
Local development and deploy previews retain `/admin/...`; `admin.localhost`
also uses the dedicated admin routes when routed to the development server.

Admin directory cards and the edit modal display the immutable `dateAdded`
field. New direct additions and first-time approvals set it on the server.
Editing or reapproving an existing club preserves it. Legacy clubs without an
explicit date show “Not recorded”; submission dates and ObjectId timestamps
are not substituted because they can predate publication. The public cards do
not display this metadata, and update requests cannot change it.

### Search, editing and archiving

Public search highlights matching text, ignoring case and accents. During a
search, cards also show category, location, schedule and website details so
matches in those fields are visible.

Admin directory editing opens a right-side drawer. Archive hides a club from the
public API without deleting it; the admin card remains marked Archived and offers
Restore. Editing an archived club keeps it archived. These actions retain the
existing key authentication and database uniqueness constraints.

“Last directory update” shows the newest server-recorded `updatedAt` (or
`dateAdded` for a new record). Edits, approvals, additions, archive and restore
operations record timestamps. Older unrecorded changes or external database edits
cannot be reconstructed; timestamps are not client-editable.

### Contact form email delivery

“Contact us” opens a name/email/message form using Netlify Forms. The static
schema in `public/contact-form.html` is required for deploy-time form detection.

1. In the Netlify project, enable form detection under Forms and deploy this code.
2. Confirm that the `contact` form appears in Forms.
3. Under Forms > Submission notifications, add an Email notification for `contact`
   addressed to `queerclubdirectory@gmail.com`.
4. Submit a real test message on the deployed site and confirm receipt. The `email`
   field becomes Reply-to, so replies go to the sender.

Localhost supports previewing the modal but intentionally does not claim to send
email. Delivery requires the deployed Netlify Forms service and its notification
configuration; no Gmail password or browser-exposed email API key is needed.

## Events calendar

- `/events`: public month calendar and chronological list for the selected month.
  Select a calendar day to see its events, including events spanning that day;
  “Show whole month” resets the day filter. Week view is not implemented yet.
- `/events/add`: public event submission form. Submissions go to
  `eventSubmissions` with status `submitted` and require admin approval.
- Admin **Events** (`/admin/events` locally, `/events` on the admin subdomain):
  manage published events and review event submissions. Add or edit via the
  drawer; check “Approve and publish when saving” to approve a submission.
  Archive hides events publicly, Restore makes them visible again, and Remove
  permanently deletes the selected event or submission after confirmation.

Events use Toronto wall-clock dates and times (`America/Toronto`), with start
and optional end dates/times. Cost is Free, PWYC, or a CAD number with up to two
fractional digits. Promo code and a linked directory club are optional. Public
cards include available details and links from the associated non-archived club.
Standalone events are supported without a linked club.

Netlify functions: `getEvents` (public, read-only), `submitEvent` (public
submission only), and `adminEvents` (requires `ADMIN_ACCESS_KEY`). Published
records use `events`; approval inserts the event and updates the submission in
one MongoDB transaction. Retrying an already-approved submission does not create
a second event. Edit the published event to update it after approval. Archiving
an event does not delete it or change its linked club.

Deploy the new functions and frontend together using the existing MongoDB and
admin environment variables. No new service or dependencies are needed. Existing
legacy event records are not migrated: admin can fill in missing fields, while
public entries require a valid calendar date. The implementation does not create
sample events in the live database.

### Weekly recurring events

The public and admin event forms offer Specific dates or Repeats weekly. Weekly
schedules select one weekday and a start time (for example, Tuesday at 19:00),
with an optional same-day end time. Series start/end dates are optional, inclusive
bounds; leaving them blank makes the weekly schedule unbounded. Specific-date
events continue to support multi-day and overnight events.

A recurring series is one MongoDB record (`recurrence: "weekly"`, `weekday: 0–6`,
Sunday first). Calendar days are matched in Toronto local calendar time rather
than converting the event time to UTC, keeping 7 pm at 7 pm across daylight saving
changes. Both month calendars and the date-grouped list show matching occurrences.
Edit, archive, restore and remove apply to the entire series, not an individual
occurrence. Existing records without a recurrence field remain specific-date
events. Deploy the frontend and updated event functions together.
