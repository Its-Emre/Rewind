# Rewind — Our memories, streaming

A **private streaming home for a family's memories**: photos and short video
clips, presented like a streaming service — a cinematic hero banner, browsable
rows, an "On This Day" throwback rail — with likes and comments on every
memory, so the group talks *on* the memory instead of losing it in a chat
scroll. Built for phones first, and for the TV on family nights.

> **Status:** Sprint 1 — invite-gated accounts, add-a-memory by Google Drive
> link, the streaming-style home (hero + rows), watch/view pages with likes
> and comments. Characters (the family cast) and albums/slideshow arrive in
> Sprint 2; deployment in Sprint 3.

## How it works — Drive-first

Media never touches this app's server. Every photo/clip stays in **Google
Drive**; Rewind stores only metadata (title, date, album, who added it, the
Drive file ID) in MongoDB.

- **Add a memory** = paste a Drive link. The backend extracts the file ID from
  any Drive URL shape and derives everything else.
- **Playback** uses Drive's embedded preview player; **photos** and **card
  art** come from Drive's thumbnail service. No Google API key, no OAuth,
  zero storage cost.
- One honest rule: each Drive file must be shared as *"Anyone with the link
  can view"* for the embed to load. The app itself stays login-gated (with a
  family invite code on registration); a leaked Drive link is the known,
  accepted trade-off of the free design — and the catalog is built so a
  hosted-media backend can replace playback later without touching anything
  else.

## Features (Sprint 1)

- Invite-gated JWT accounts — registration requires the family invite code
- Streaming-service home: hero banner (On This Day first), rows for
  *On This Day*, *Recently Added*, *Most Loved*, and one rail per album
- Watch/view pages: Drive player for clips, full-screen photos, like button
  with a who-liked list, and a comment thread per memory
- Add Memory form with a live thumbnail preview as soon as a valid Drive
  link is pasted, plus plain-English sharing instructions for the family
- Cinematic dark UI: warm amber accent, Fraunces + Inter, mobile-first,
  TV-friendly focus states

## Tech stack

| Layer | Tech |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT + bcryptjs (+ family invite code) |
| Media | Google Drive (embeds + thumbnail service) |

## Run it locally

You need two terminals — one for the server, one for the client.

**1. Server**
```bash
cd server
npm install
cp .env.example .env   # then fill in your values (see below)
npm run dev            # http://localhost:5000
```

`server/.env` needs:
- `MONGO_URI` — a MongoDB Atlas connection string. **Use a database named
  `rewind`** in the path, e.g. `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/rewind?...`
  (the part before `.mongodb.net` is the cluster name — leave it untouched;
  only the database name after it changes per app)
- `JWT_SECRET` — any long random string
- `CLIENT_URL` — `http://localhost:5173`
- `FAMILY_CODE` — the invite code registration asks for. **Required in
  production**; if unset, registration is open (local development only)

**2. Client**
```bash
cd client
npm install
npm run dev            # http://localhost:5173
```

Create your account (with the invite code), add a memory by pasting a shared
Drive link, and press play.

## Project layout

```
client/   React + Vite + Tailwind frontend (streaming-style home, watch pages)
server/   Express API — invite-gated auth, memory catalog, likes, comments
```

## Author

Built by **Utkarsh Rawat (EMRE)** — B.Tech Computer Science, Class of 2028.
A family project, after [CampusKhoj](https://github.com/Its-Emre/Campuskhoj),
[NoteWise](https://github.com/Its-Emre/NoteWise), and
[SyncPad](https://github.com/Its-Emre/SyncPad).
