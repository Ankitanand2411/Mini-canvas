# Mini Canvas

A small design canvas: create canvases, drop in rectangles, circles and text, move / resize / rotate them, tweak their properties, and have everything saved to MongoDB as you go.

- **Frontend** - Next.js (App Router, TypeScript), React Konva for the editor, Tailwind for the UI.
- **Backend** - Node + Express REST API with Mongoose, zod validation and JWT auth.

## Running it locally

You need Node 20+ and a MongoDB instance (local or Atlas).

```bash
git clone https://github.com/Ankitanand2411/Mini-canvas.git
cd Mini-canvas

# API
cd server
cp .env.example .env          # set MONGODB_URI and JWT_SECRET
npm install
npm run dev                   # http://localhost:4000

# Web app (second terminal)
cd ../client
cp .env.example .env.local    # NEXT_PUBLIC_API_URL, defaults to http://localhost:4000/api
npm install
npm run dev                   # http://localhost:3000
```

Open http://localhost:3000, create an account, and hit **New canvas**.

### MongoDB

Any MongoDB 6+ works. The quickest options:

```bash
# Docker
docker run -d --name mini-canvas-mongo -p 27017:27017 mongo:7

# or Homebrew on macOS
brew tap mongodb/brew && brew install mongodb-community && brew services start mongodb-community
```

Then point `MONGODB_URI` at it (`mongodb://127.0.0.1:27017/mini-canvas` is the default). For Atlas, paste the connection string from the cluster's *Connect* dialog. Collections and indexes are created on first use - there is no migration step.

### Environment variables

`server/.env`

| Variable         | Default                                   | Notes                                                    |
| ---------------- | ----------------------------------------- | -------------------------------------------------------- |
| `PORT`           | `4000`                                    |                                                          |
| `MONGODB_URI`    | -                                         | required                                                 |
| `JWT_SECRET`     | -                                         | required, at least 16 characters                         |
| `JWT_EXPIRES_IN` | `7d`                                      | anything `jsonwebtoken` accepts                          |
| `CLIENT_ORIGIN`  | `http://localhost:3000`                   | allowed CORS origin(s), comma-separated for more than one |
| `NODE_ENV`       | `development`                             |                                                          |

`client/.env.local`

| Variable              | Default                     |
| --------------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api` |

Both directories ship a `.env.example`.

## How it's put together

```
client/                      Next.js app
  src/app/                   routes: / (dashboard), /login, /register, /canvas/[id] (editor)
  src/components/editor/     CanvasStage (Konva Stage/Layer/Transformer), ElementNode, PropertiesPanel,
                             LayersPanel, Toolbar, EditorHeader, inline TextEditor
  src/components/dashboard/  canvas list with SVG thumbnails
  src/components/auth/       login/register form, RequireAuth guard
  src/hooks/                 useHistory (undo/redo), useAutosave, useEditorState, useElementSize
  src/lib/                   api client, auth context, element factories, PNG export
  src/types/                 shared Canvas / CanvasElement types

server/                      Express API
  src/index.js               boot: env -> Mongo -> listen, graceful shutdown
  src/app.js                 middleware stack and route mounting
  src/config/                env validation, Mongo connection
  src/routes/                /api/auth, /api/canvases, /api/health
  src/controllers/           request handlers
  src/models/                User, Canvas (elements are embedded subdocuments)
  src/validation/            zod schemas - the source of truth for request shapes
  src/middleware/            requireAuth, validate, notFound + errorHandler
  src/errors/                ApiError
```

### Editor state

The editor keeps the element list in React state wrapped by a small history hook (`useHistory`). Every committed change - add, delete, drag end, transform end, a property edit - pushes a snapshot, which is what undo/redo walks through. Continuous edits like typing into a field or dragging the colour picker are flagged *transient* so a whole run collapses into a single undo step.

Konva does the heavy lifting for interaction: shapes are `draggable`, and a single `Transformer` is attached to whichever node is selected. On `dragend`/`transformend` the node's scale is folded back into `width`/`height` and written to state, so the model always holds plain geometry (no scale factors) and the panel, the thumbnails and the API all read the same numbers.

The `Stage` is scaled to fit the viewport; the model is always in canvas pixels. Circles are stored as their bounding box (`x`, `y`, `width`, `height`) like everything else and rendered as a Konva `Ellipse`, so the same transformer and property fields work for all three element types.

### Persistence

`useAutosave` watches the document (title, size, background, elements) and PUTs it 1.2 s after the last change; ⌘/Ctrl+S forces a save, and a pending save is flushed when you navigate away. The header shows the current state (unsaved / saving / saved / failed). The API replaces the whole `elements` array on each save - canvases are small, and it keeps the client and server trivially in sync.

Auth is a JWT in `localStorage`, attached as a Bearer header by the API client. A 401 from any canvas route clears the session and bounces to `/login`. Canvases are scoped to their owner on every query, so another user's canvas simply 404s.

## API

Base path `/api`. Everything is JSON. Canvas routes need `Authorization: Bearer <token>`.

| Method   | Path                 | Body                                                     | Response                              |
| -------- | -------------------- | -------------------------------------------------------- | ------------------------------------- |
| `POST`   | `/auth/register`     | `{ name, email, password }`                              | `201 { token, user }`                 |
| `POST`   | `/auth/login`        | `{ email, password }`                                    | `200 { token, user }`                 |
| `GET`    | `/auth/me`           |                                                          | `200 { user }`                        |
| `GET`    | `/canvases`          |                                                          | `200 Canvas[]` (newest first)         |
| `POST`   | `/canvases`          | `{ title?, width?, height?, background?, elements? }`    | `201 Canvas`                          |
| `GET`    | `/canvases/:id`      |                                                          | `200 Canvas`                          |
| `PUT`    | `/canvases/:id`      | any subset of the fields above; `elements` is replaced   | `200 Canvas`                          |
| `DELETE` | `/canvases/:id`      |                                                          | `204`                                 |
| `GET`    | `/health`            |                                                          | `200 { status: 'ok' }`                |

A canvas looks like:

```json
{
  "id": "66e3f1c2a9b4d20012ab34cd",
  "title": "Launch poster",
  "width": 1280,
  "height": 800,
  "background": "#ffffff",
  "elements": [
    { "id": "k3Jd9sQ1xZ", "type": "rect", "name": "Rectangle 1", "x": 520, "y": 320,
      "width": 240, "height": 160, "rotation": 0, "fill": "#4f46e5", "cornerRadius": 8,
      "opacity": 1, "visible": true, "locked": false }
  ],
  "owner": "66e3f0a1a9b4d20012ab34aa",
  "createdAt": "2026-09-15T10:12:44.120Z",
  "updatedAt": "2026-09-15T10:31:02.554Z"
}
```

Element `type` is `rect`, `circle` or `text`. Text elements also carry `text`, `fontSize`, `fontFamily`, `fontStyle` and `align`.

Errors come back as `{ message, errors? }` where `errors` is a list of `{ path, message }` for validation failures:

| Status | When                                                            |
| ------ | --------------------------------------------------------------- |
| `400`  | validation failed, malformed JSON, invalid id                   |
| `401`  | missing / invalid / expired token, wrong credentials            |
| `404`  | unknown route, or canvas not found (including someone else's)   |
| `409`  | email already registered                                        |
| `413`  | body over 2 MB                                                  |
| `500`  | anything unexpected (stack is logged server-side, never sent)   |

Request bodies are validated with zod using `.strict()`, so unknown keys are rejected rather than silently dropped.

## Features

Core

- Create, open, rename, delete canvases
- Rectangle, circle and text elements
- Select, drag, resize and rotate with the Konva Transformer (rotation snaps at 45°)
- Edit position, size, rotation, corner radius, fill, opacity, text, font size, weight and alignment from the panel
- Double-click a text element to edit it in place
- Delete / Backspace removes the selection; `R`, `C`, `T` add elements; `D` duplicates

Bonus

- **Layers** - ordered list, reorder up/down, show/hide, lock
- **Undo / redo** - ⌘Z / ⇧⌘Z (Ctrl on Windows/Linux), 100 steps
- **Autosave** - debounced PUT with a visible status indicator, ⌘S to force
- **Authentication** - register/login, bcrypt-hashed passwords, JWT, per-user canvases
- **PNG export** - 2× resolution regardless of zoom, transformer handles excluded

## Known limitations

- Single selection only; no marquee or shift-click multi-select.
- No pan/zoom controls - the canvas is scaled to fit the viewport.
- Last write wins. Two tabs editing the same canvas will overwrite each other; there is no conflict detection or realtime sync.
- The JWT lives in `localStorage`, which is fine for this scope but an httpOnly cookie would be the safer choice in production. There is no refresh token or logout-everywhere.
- Text height is derived from Konva's measurement, so the `height` stored for text elements is informational.
- Fonts are limited to what the browser has installed; there is no font picker.
- No automated tests yet. Everything was exercised by hand end to end; a Jest/supertest suite for the API is the obvious next step.
