# CampusCrate — Frontend (React)

Smart Student Resource Exchange Platform — React + Vite UI

**Local URL:** `http://localhost:5173`  
**Backend URL:** `http://localhost:3400`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 (Vite) |
| Routing | React Router v6 |
| State | Context API (Auth, Socket, Wishlist) |
| Real-time | Socket.io client |
| Animations | Framer Motion |
| Icons | Lucide React |
| HTTP | Axios |
| Fonts | Inter (all pages) |
| Styling | Inline CSS-in-JS + CSS custom properties (index.css) |

---

## Design System (index.css)

**Theme: Premium Teal / Amber**

| Token | Value | Usage |
|-------|-------|-------|
| `--color-brand` | `#215E61` | Teal — buttons, active states, links |
| `--color-brand-hover` | `#194A4D` | Darker teal on hover |
| `--color-brand-light` | `rgba(33,94,97,0.18)` | Light teal backgrounds |
| `--color-brand-pale` | `#E6EEEE` | Very light teal — active nav items |
| `--color-accent` | `#FF9E20` | Amber — highlights, warnings |
| `--color-accent-dk` | `#D98212` | Dark amber |
| `--color-dark` | `#1D2128` | Near-black — secondary buttons |
| `--color-bg` | `#F4F2F2` | Page background (warm off-white) |
| `--color-card` | `#FFFFFF` | Card/surface white |
| `--color-text` | `#1D2128` | Primary text |
| `--color-text-sub` | `rgba(29,33,40,0.72)` | Secondary text |
| `--color-danger` | `#D98212` | Danger/error (amber-red) |
| `--color-danger-pale` | `#FEE2E2` | Danger backgrounds |
| Typography | Inter | All pages (system fallback) |
| Spacing | 8px system | `--space-1` (4px) to `--space-20` (80px) |
| Radius | `--radius-sm` (6px) to `--radius-full` (9999px) | |

**Global CSS classes defined:** `.auth-*`, `.btn-*`, `.card`, `.form-*`, `.navbar`, `.sidebar`, `.chat-*`, `.conv-*`, `.notif-*`, `.hp-*` (homepage), `.profile-*`

---

## Project Structure

```
CampusCrate-UI/
├── public/
│   └── uploads/                        # Static assets (images)
├── src/
│   ├── main.jsx                        # React entry point
│   ├── App.jsx                         # Route definitions
│   ├── index.css                       # Global design system + CSS variables
│   ├── api/
│   │   └── axios.js                    # Axios instance (baseURL + JWT interceptor)
│   ├── context/
│   │   ├── AuthContext.jsx             # User auth state (login/logout/token)
│   │   ├── SocketContext.jsx           # Socket.io + unread counts + typing
│   │   └── WishlistContext.jsx         # Global wishlist state
│   ├── components/
│   │   ├── UserLayout.jsx              # Navbar + page wrapper for all user pages
│   │   ├── ProtectedRoute.jsx          # Redirect to /login if not authed
│   │   ├── AdminProtectedRoute.jsx     # Redirect to /admin/dashboard if not admin
│   │   └── CustomCursor.jsx            # Custom cursor + trail effect
│   ├── hooks/
│   │   └── useProfileGate.js           # Redirect if profile incomplete
│   └── pages/
│       ├── Homepage.jsx                # Landing + listings (premium teal/green design)
│       ├── Dashboard.jsx               # My listings with CRUD + Mark as Sold
│       ├── Messages.jsx                # Real-time chat (resource-scoped threads)
│       ├── Notifications.jsx           # In-app notifications
│       ├── Profile.jsx                 # Edit my profile
│       ├── PublicProfile.jsx           # Any user's public profile
│       ├── Wishlist.jsx                # Saved resources
│       ├── auth/
│       │   ├── AuthPage.jsx            # Login/Signup tabs combined (sliding animation)
│       │   ├── Login.jsx               # Login form
│       │   ├── Signup.jsx              # Signup form (multi-step indicator)
│       │   └── VerifyOTP.jsx           # OTP verification
│       ├── resources/
│       │   ├── ExploreResources.jsx    # Browse/search all resources
│       │   ├── AddResource.jsx         # Create new listing (also Edit mode)
│       │   └── ResourceDetail.jsx      # Single resource detail + request/chat
│       └── admin/
│           └── AdminDashboard.jsx      # Admin panel (users + resources management)
```

> **Note:** `AdminLogin.jsx` has been removed. Admin login is handled directly in `AdminDashboard.jsx` or via the main auth flow with role check.

---

## Setup & Run

```bash
cd CampusCrate-UI
npm install
npm run dev      # → http://localhost:5173
```

Make sure the backend is running at `http://localhost:3400` first.

---

## All Pages & Routes

| Route | Page | Auth | Description |
|-------|------|------|-------------|
| `/` | Homepage | JWT | Listings, categories, hero, community section |
| `/login` | AuthPage | No | Login tab |
| `/signup` | AuthPage | No | Signup tab |
| `/verify-otp` | VerifyOTP | No | OTP verification after signup |
| `/dashboard` | Dashboard | JWT | My listings (CRUD + Mark as Sold) |
| `/resources` | ExploreResources | JWT | Browse all available + sold resources |
| `/add-resource` | AddResource | JWT | Create new listing |
| `/add-resource?edit=RSC-001` | AddResource | JWT | Edit existing listing |
| `/resource/:id` | ResourceDetail | JWT | Resource detail + Request/Chat |
| `/messages` | Messages | JWT | Real-time chat (resource-scoped) |
| `/notifications` | Notifications | JWT | In-app notifications |
| `/profile` | Profile | JWT | Edit my profile |
| `/profile/:rollNumber` | PublicProfile | No | Any student's public profile |
| `/wishlist` | Wishlist | JWT | Saved/favourited resources |
| `/admin/dashboard` | AdminDashboard | Admin JWT | Admin panel |

---

## Key Features

### Authentication
- Login/Signup on one page with animated sliding tab switch
- Multi-step indicator on signup form (visual progress)
- OTP email verification via Brevo SMTP
- JWT stored in localStorage, auto-attached via Axios interceptor
- Redirect to `/login` if token missing/expired

### Profile Gate
- If `roll_number`, `course`, `batch`, `semester` are incomplete → API returns `403 profileIncomplete: true`
- Frontend shows profile completion banner on Homepage with missing fields listed

### Homepage (Premium Design)
- Sticky nav with blur backdrop, user avatar dropdown, notification/message badges
- Hero section: green gradient bg, headline, CTA buttons, animated activity cards (right side visual)
- Categories grid (3-col): Books, Notes, Stationery, Projects, Other
- Filter pills: All / Free / Paid / Exchange
- Listings grid (4-col responsive)
- Community stats section (dark `#0F172A` background)
- Features section (4-col cards)
- Testimonials section (3-col)
- CTA banner (green gradient)
- Footer (dark, 4-col grid)
- Mobile: hamburger menu, all grids collapse to 1-col

### Dashboard (My Resources)
- Card grid (3 col → 2 → 1 on mobile)
- Each card: image, status pill, title, price, View / Edit / Delete / Mark as Sold
- **Edit:** navigates to `/add-resource?edit=<id>` (pre-fills form)
- **Delete:** confirmation modal
- **Mark as Sold:** double confirmation modal — toggle Available ↔ Sold
- Sold cards: faded (opacity 0.65, grayscale 40%), red border, SOLD overlay badge

### Mark as Sold (OLX-style)
- Confirmation modal before marking sold or re-listing
- Sold cards non-clickable, faded across all pages:
  - Homepage, Explore Resources, Wishlist, Public Profile
- Sold resource detail: red banner instead of message/request buttons
- New chat blocked server-side for sold resources

### Real-time Chat (Resource-scoped Threads)
- Each product gets its own separate chat thread (like OLX)
- Sidebar shows `📦 Resource Title` or `🔴 Resource Title` (sold)
- Chat header: OLX-style product card (image, name, price)
- Sold resource: "This ad has been disabled by the seller" banner replaces input
- Image + voice note sending (Cloudinary)
- Typing indicators, read receipts, unread badge counts
- Online/Offline status via Socket.io

### Explore Resources
- 4-column grid (responsive to 1)
- Category + Type filter pills
- Search by title/category
- Sold cards: faded, non-clickable, SOLD badge, no wishlist button

### Wishlist
- Toggle add/remove from any card
- Global WishlistContext — consistent state across all pages
- Sold items: faded + SOLD badge, remove still works

### Admin Dashboard
- Full user management: list, view profile, suspend/unsuspend, delete, verify/unverify
- Resource management: list all, delete
- Deal management: view all exchanges
- Stats overview (counts)

---

## Context Providers

### AuthContext (`src/context/AuthContext.jsx`)
```js
const { user, token, isAuthenticated, loading, login, logout } = useAuth();
```
- Reads token from localStorage on mount
- `login(token, userData)` — saves to state + localStorage
- `logout()` — clears state + localStorage → redirect to `/login`

### SocketContext (`src/context/SocketContext.jsx`)
```js
const { socket, onlineUsers, lastIncomingMessage, typingUsers,
        totalUnreadMessages, unreadNotifications,
        emitTyping, emitStopTyping, emitMessagesRead } = useSocket();
```
- Connects on login with JWT, disconnects on logout
- Tracks: `onlineUsers` (Set), `typingUsers`, unread message + notification counts
- Handles: `user-online`, `user-offline`, `online-users-list`, `receive-message`, `new-notification`, `user-typing`, `user-stop-typing`, `messages-marked-read`

### WishlistContext (`src/context/WishlistContext.jsx`)
```js
const { wishlistIds, toggleWishlist, isWishlisted } = useWishlist();
```
- Fetches wishlist IDs on mount
- Toggle with optimistic UI update

---

## Axios Setup (`src/api/axios.js`)

```js
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3400'
// Auto-attach JWT on every request:
headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`
```

---

## Sold Card Treatment (All Pages)

```js
opacity: 0.65
filter: 'grayscale(40%)'
border: '1px solid #FECACA'
cursor: 'not-allowed'
```

SOLD overlay badge on image:
```jsx
<span style={{ background: '#991B1B', color: '#fff', padding: '6px 20px',
  borderRadius: 9999, fontSize: 13, fontWeight: 800 }}>SOLD</span>
```

---

## GitHub

Repo: https://github.com/aftabbbx/CampusCrate-UI  
Branch: `main`
