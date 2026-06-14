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
| Fonts | Poppins (Google Fonts) |
| Styling | Inline CSS-in-JS + CSS custom properties |

---

## Design System

**Theme: Coral + Navy + Poppins** (furniture-app inspired)

| Token | Value | Usage |
|-------|-------|-------|
| Primary (Coral) | `#FF5C5C` | Buttons, accents, price, links |
| Primary Hover | `#FF4242` | Button hover state |
| Primary Pale | `#FFECEC` | Hover backgrounds, tags |
| Dark (Navy) | `#242B3D` | Action buttons, text, avatar bg |
| Dark Hover | `#1A2030` | Dark button hover |
| Background | `#F6F7FB` | Page background |
| Border | `rgba(36,43,61,0.07)` | Dividers, card borders |
| Text | `#242B3D` | Primary text |
| Text Sub | `#8A94A6` | Secondary/muted text |
| Danger | `#BA1A1A` | Delete, error states |

CSS variables (in `src/index.css`) affect global components like Profile, Messages, AuthPage, AdminLogin:
```css
--color-brand: #FF5C5C
--color-dark: #242B3D
--color-bg: #F6F7FB
--font-display: 'Poppins', system-ui, sans-serif
```

---

## Project Structure

```
CampusCrate-UI/
├── index.html                          # Poppins font loaded here
├── src/
│   ├── main.jsx                        # React entry point
│   ├── App.jsx                         # Route definitions
│   ├── index.css                       # Global CSS variables + base styles
│   ├── api/
│   │   └── axios.js                    # Axios instance (baseURL + JWT interceptor)
│   ├── context/
│   │   ├── AuthContext.jsx             # User auth state (login/logout/token)
│   │   ├── SocketContext.jsx           # Socket.io + unread counts
│   │   └── WishlistContext.jsx         # Global wishlist state
│   ├── components/
│   │   ├── UserLayout.jsx              # Navbar + page wrapper for all user pages
│   │   ├── ProtectedRoute.jsx          # Redirect to /login if not authed
│   │   ├── AdminProtectedRoute.jsx     # Redirect to /admin/login if not admin
│   │   └── CustomCursor.jsx            # Custom cursor + trail effect
│   ├── hooks/
│   │   └── useProfileGate.js           # Redirect to profile if incomplete
│   └── pages/
│       ├── Homepage.jsx                # Landing page (public listings, hero)
│       ├── Dashboard.jsx               # My listings with Edit/Delete CRUD
│       ├── Messages.jsx                # Real-time chat
│       ├── Notifications.jsx           # In-app notifications
│       ├── Profile.jsx                 # Edit my profile
│       ├── PublicProfile.jsx           # View any user's public profile
│       ├── Wishlist.jsx                # Saved resources
│       ├── auth/
│       │   ├── AuthPage.jsx            # Login/Signup tabs combined
│       │   ├── Login.jsx               # Login form
│       │   ├── Signup.jsx              # Signup form
│       │   └── VerifyOTP.jsx           # OTP verification
│       ├── resources/
│       │   ├── ExploreResources.jsx    # Browse/search all resources
│       │   ├── AddResource.jsx         # Create new listing (also Edit mode)
│       │   └── ResourceDetail.jsx      # Single resource detail + request button
│       └── admin/
│           ├── AdminLogin.jsx          # Admin login page
│           └── AdminDashboard.jsx      # Admin panel (users + resources)
```

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
| `/` | Homepage | Yes | Landing with hero, categories, listings |
| `/login` | AuthPage | No | Login tab |
| `/signup` | AuthPage | No | Signup tab |
| `/verify-otp` | VerifyOTP | No | OTP verification after signup |
| `/dashboard` | Dashboard | Yes | My listed resources (CRUD) |
| `/resources` | ExploreResources | Yes | Browse all available resources |
| `/add-resource` | AddResource | Yes | Create new listing |
| `/add-resource?edit=RSC-001` | AddResource | Yes | Edit existing listing |
| `/resource/:id` | ResourceDetail | Yes | Resource detail + Request/Chat |
| `/messages` | Messages | Yes | Real-time chat |
| `/notifications` | Notifications | Yes | In-app notifications |
| `/profile` | Profile | Yes | Edit my profile |
| `/profile/:rollNumber` | PublicProfile | No | Any student's public profile |
| `/wishlist` | Wishlist | Yes | Saved/favourited resources |
| `/admin/login` | AdminLogin | No | Admin login |
| `/admin/dashboard` | AdminDashboard | Admin | Admin panel |

---

## Key Features

### Authentication
- Login/Signup with OTP email verification
- JWT token stored in localStorage
- Auto-attach token on all API calls via Axios interceptor
- Redirect to `/login` if token missing/expired

### Dashboard (My Resources)
- Card grid layout (3 col → 2 → 1 on mobile)
- Skeleton loading cards (not spinner)
- Each card: image, status pill, title, coral price, View / Edit / Delete buttons
- **Edit:** navigates to `/add-resource?edit=<id>` (pre-fills form)
- **Delete:** opens custom modal confirmation (not browser alert)
- Soft delete — resource hidden from explore but not erased from DB

### Add/Edit Resource
- Same page for create and edit (`isEditMode` via `?edit=` query param)
- Pre-fills all fields when editing
- Image upload to Cloudinary before form submit
- Profile completion check — incomplete profiles blocked

### Real-time Chat
- Socket.io powered messaging
- Conversation list with unread badge counts
- Read receipts (markAsRead on open)
- Unread counts in navbar badges (messages + notifications)

### Wishlist
- Toggle add/remove from any resource card
- Global WishlistContext — consistent state across pages
- Confirmation modal before removing

### Custom Cursor
- Coral colored custom cursor
- Trail effect on mouse move

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
const { socket, totalUnreadMessages, unreadNotifications } = useSocket();
```
- Connects socket on login, disconnects on logout
- Listens for `newMessage` and `notification` events
- Exposes unread counts for navbar badges

### WishlistContext (`src/context/WishlistContext.jsx`)
```js
const { wishlistIds, toggleWishlist, isWishlisted } = useWishlist();
```
- Fetches wishlist IDs on mount
- Toggle add/remove with optimistic UI update

---

## Axios Setup (`src/api/axios.js`)

```js
baseURL: 'http://localhost:3400'
// Auto-attach JWT:
headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`
```

---

## Backup Files

Several pages have `.BACKUP.jsx` files kept for reference:
- `Dashboard.BACKUP.jsx` — original table-based dashboard
- `Homepage.BACKUP.jsx` — pre-optimization homepage
- `Messages.BACKUP.jsx`, `Profile.BACKUP.jsx`, etc.

These are excluded from git via `.gitignore`.

---

## GitHub

Repo: https://github.com/aftabbbx/CampusCrate-UI  
Branch: `main`
