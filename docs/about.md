# ឯកសារពន្យល់ Project — Koupreng Invitation

> ឯកសារនេះពន្យល់ project ទាំងមូលជាភាសាខ្មែរ សម្រាប់អ្នកដែលទើបចូលរួម project ឬចង់យល់រួមមុនពេលកែ code។
>
> Project URL៖ https://github.com/Nha0325/Koupreng-invitation_project

---

## 1. Project Tree (រចនាសម្ព័ន្ធ folder)

```txt
Koupreng-invitation_project/
├── frontend-user/          # React + Vite app សម្រាប់អ្នកប្រើ (marketing + dashboard)
├── frontend-admin/         # React + Vite app សម្រាប់ admin (នៅជា scaffold ដំបូង)
├── backend/                # Spring Boot 4 (Java 25) — REST API
├── supabase/               # Supabase config + SQL migrations
├── runGit/                 # Shell scripts ជំនួយ git push/pull
├── setup.ps1               # PowerShell script សម្រាប់ setup environment
├── .env / .env.example     # Env variables (URL, keys)
├── README.md               # ឯកសារ project ដើម (ភាសាអង់គ្លេស)
├── restore.git.md          # កំណត់ហេតុ git restore
└── about.md                # ឯកសារនេះ
```

### Tree លម្អិត — `frontend-user/src/`

```txt
frontend-user/src/
├── main.jsx                # Entry point — React DOM mount
├── App.jsx                 # File ស្ទួន Vite scaffold (មិនត្រូវបានប្រើ)
├── App.css                 # CSS របស់ App.jsx ស្ទួន
├── index.css               # Global CSS (Tailwind + fonts)
│
├── app/                    # App-level setup
│   ├── App.jsx             # App ពិតប្រាកដ (providers + router)
│   ├── router.jsx          # កំណត់ Routes ទាំងអស់
│   ├── auth/
│   │   ├── AuthContext.jsx # AuthProvider + state user/isAuthenticated
│   │   ├── useAuth.js      # Hook មើល auth state
│   │   └── RequireAuth.jsx # Route guard (មិនទាន់ប្រើ)
│   └── theme/
│       ├── ThemeContext.jsx
│       └── useTheme.js
│
├── assets/                 # រូបភាព icons fonts
│   ├── fonts/fonts.css
│   ├── icons/ (background, icon-1..4, ...)
│   ├── hero.png, logo.png, react.svg, vite.svg
│
├── features/               # Feature modules (មួយ folder មួយ feature)
│   ├── add-template/       # ទម្រង់បន្ថែម template ថ្មី
│   ├── admin/              # AdminOverview, ManageUsers, ManageTemplates
│   ├── dashboard/          # Dashboard ផ្ទាំងសរុបរបស់ host
│   ├── events/             # CreateEventForm, EventsList
│   ├── expenses/           # ExpensesList
│   ├── guests/             # GuestsList
│   ├── invitation/         # TemplateRenderer + templates/(Classic, Floral, Luxury, Modern)
│   ├── templates/          # Gallery + ClassicPreview + PreviewWedding + useCountdown
│   └── wedding-gift/       # WeddingGiftList
│
├── layouts/                # Layout shells
│   ├── MarketingShell.jsx  # Header + Footer (សម្រាប់ home/pricing/venues)
│   ├── AuthShell.jsx       # Layout សាមញ្ញសម្រាប់ login/register
│   ├── HostShell.jsx       # Sidebar (Aside) សម្រាប់ dashboard host
│   ├── AdminShell.jsx      # Sidebar សម្រាប់ admin
│   ├── InvitationShell.jsx
│   └── components/         # Header, Footer, Aside, AdminSidebar
│
├── lib/
│   └── supabase.ts         # Supabase client (auth + storage)
│
├── mocks/
│   └── inMemoryDb.js       # Mock data សម្រាប់ test ក្នុង frontend
│
├── pages/                  # Page wrappers — តភ្ជាប់ route ទៅ feature
│   ├── admin/  (DashboardPage, TemplatesPage, UsersPage)
│   ├── auth/   (LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, AuthPage.css)
│   ├── host/   (DashboardPage, EventsPage, CreateEventPage, GuestsPage, ExpensesPage, WeddingGiftPage, TemplatesPage, AddTemplatePage)
│   └── marketing/ (HomePage, PricingPage, VenuesPage, TemplatesPage, NotFoundPage, HomePage.css)
│
└── shared/                 # Code ដែលប្រើបានច្រើនកន្លែង
    ├── api/                # client.js (fetch wrapper), errors.js
    ├── hooks/              # useToggle, useLenis, useImageSlider, useHeroAnimation, usePrefersReducedMotion
    ├── motion/             # variants.js (Framer Motion configs)
    ├── services/           # authService, eventService, guestService
    └── ui/                 # Button, GlassCard, MagicCard, Spinner, TimePicker, Toaster, ScrollReveal, PageTransition, AnimatedButton
```

### Tree — `backend/src/main/java/com/koupreng/backend/`

```txt
backend/
├── BackendApplication.java    # Entry point Spring Boot
├── common/                    # ApiException, GlobalExceptionHandler
├── config/                    # SecurityConfig, AppJwtAuthenticationConverter, AppProperties
├── controller/                # REST controllers (HealthController, UserController, AdminUserController)
├── dto/                       # Request/Response DTOs
├── entity/                    # JPA entities
│   ├── user/                  # AppUser, Role, AuthProvider
│   ├── invitation/            # UserInvitation, Guest, Rsvp, InvitationTemplate, MediaFile, ...
│   ├── payment/               # PaymentTransaction, PaymentConfig, PaymentWebhookLog, ...
│   ├── subscription/          # Subscription, SubscriptionPackage
│   ├── budget/                # Budget, BudgetItem
│   └── audit/                 # AuditLog
├── repository/                # Spring Data JPA repositories
├── security/                  # Filters, validators, interceptors
├── service/                   # UserService, RateLimitService
└── waf/                       # Web Application Firewall filter
```

---

## 2. Project នេះជាអ្វី

**Koupreng Invitation Project** ជា platform រៀបចំពិធីមង្គលការ (wedding planning) និងបង្កើតសន្លឹកអញ្ជើញឌីជីថល (digital invitation) សម្រាប់ទីផ្សារកម្ពុជា។

### គោលបំណង
- ឲ្យគូស្វាមីភរិយា (host) អាចបង្កើតព្រឹត្តិការណ៍មង្គលការ ជ្រើសរើស template, គ្រប់គ្រងភ្ញៀវ, តាមដានចំណាយ, និងផ្ញើ link អញ្ជើញឌីជីថលបាន។
- ឲ្យអ្នកគ្រប់គ្រង (admin) មើល users, templates និងស្ថិតិទូទៅ។
- ឲ្យអ្នកប្រើទូទៅអាចមើល pricing, venues, និង templates មុនពេលចុះឈ្មោះ។

### User ធ្វើអ្វីបាន
- មើល marketing pages (Home, Pricing, Venues)
- រកមើល templates ក្នុង gallery
- មើល preview សន្លឹកអញ្ជើញពេញលេញ (mobile-style phone frame)
- ចុះឈ្មោះ / ចូលគណនី (email + password ឬ Google OAuth)
- បង្កើតព្រឹត្តិការណ៍ថ្មីពី template
- គ្រប់គ្រងភ្ញៀវ, ចំណាយ, ចំណងដៃ
- មើល dashboard សរុប

### ប្រភេទ
- Multi-tenant SaaS web application (Khmer-first UI)
- Frontend៖ React 19 + Vite + Tailwind CSS 4
- Backend៖ Spring Boot 4 REST API (Java 25)
- Auth + Storage៖ Supabase (Google OAuth, email/password)

---

## 3. បច្ចេកវិទ្យាដែល Project ប្រើ

### Frontend (frontend-user)

| Tech | ជាអ្វី | ប្រើសម្រាប់អ្វី | File ទាក់ទង |
|---|---|---|---|
| **React 19** | UI library | បង្កើត components, pages, state | `src/**/*.jsx` |
| **Vite 8** | Build tool + dev server | រត់ dev server លឿន + build production | `vite.config.js`, `package.json` |
| **React Router 7** | Client-side routing | គ្រប់គ្រង URL → page mapping | `src/app/router.jsx` |
| **Tailwind CSS 4** | Utility-first CSS | Styling លឿន + responsive | `src/index.css` (`@import "tailwindcss"`) |
| **Framer Motion** | Animation library | Page transitions, scroll reveals | `src/shared/motion/variants.js`, `src/shared/ui/PageTransition.jsx` |
| **Lenis** | Smooth scroll | ឲ្យ scroll ភ្នែករឆ្នៃ​លក្ខណៈ premium | `src/shared/hooks/useLenis.js` |
| **Anime.js** | Animation engine | Hero animations | `src/shared/hooks/useHeroAnimation.js` |
| **Supabase JS** | Auth + DB client | Login Google/email, session | `src/lib/supabase.ts`, `src/pages/auth/LoginPage.jsx` |
| **React Icons** | Icon set | Icons ក្នុង UI | `package.json` |
| **ESLint** | Linter | រកកំហុស code | `eslint.config.js` |

### Backend (backend/)

| Tech | ជាអ្វី | ប្រើសម្រាប់អ្វី |
|---|---|---|
| **Spring Boot 4** | Java framework | REST API server |
| **Java 25** | Programming language | Source language |
| **Spring Data JPA** | ORM | Database access |
| **Spring Security + OAuth2 Resource Server** | Auth | JWT verification (Supabase tokens) |
| **Spring Data Redis** | Redis client | Rate limiting + cache |
| **Flyway** | DB migration | Schema versioning |
| **Spring Mail** | Email | Notifications |
| **Maven** | Build tool | Dependency management |

### Supabase

| Component | ប្រើសម្រាប់ |
|---|---|
| **Auth** | Google OAuth, email/password, session |
| **Postgres** | Storage data (users, invitations, payments, ...) |
| **Storage** | Media files (images, fonts) |
| **Migration** | `supabase/migrations/20260515154827_initial_schema.sql` |

### ហេតុអ្វីប្រើ stack បែបនេះ?
- **React + Vite**៖ Build លឿន, HMR លឿន, ecosystem ធំ, ងាយរកអ្នកសរសេរ។
- **Tailwind**៖ ឲ្យសរសេរ UI លឿន មិនបាច់ឈ្មោះ class ច្រើន។
- **Supabase**៖ បន្តពេលវេលា auth + database + storage ក្នុង service តែមួយ មិនបាច់ self-host។
- **Spring Boot**៖ មាន ecosystem ស្តង់ដារសម្រាប់ REST API, security, JPA, និងជា backend ដែលអាច scale បាន។
- **Framer Motion + Lenis**៖ ឲ្យ UX មាន feel premium ស្របទៅនឹង market wedding។

---

## 4. ពន្យល់ Folder សំខាន់ៗ

### `frontend-user/src/main.jsx`
Entry point — React DOM mount ទៅ `#root` div ក្នុង `index.html`។ Import `App` ពី `./app/App` ហើយ wrap ក្នុង `<React.StrictMode>`។

### `frontend-user/src/app/`
**App-level setup** — អ្វីៗដែលគ្រប់ page ប្រើរួម៖
- `App.jsx`៖ Wrap ApplicationProviders → `<ThemeProvider>` + `<AuthProvider>` + `<Router>` + ហៅ `useLenis()` សម្រាប់ smooth scroll។
- `router.jsx`៖ កំណត់ Routes ទាំងអស់ — marketing, auth, host, admin។
- `auth/`៖ AuthContext + useAuth hook + RequireAuth route guard។
- `theme/`៖ ThemeContext + useTheme hook (light/dark)។

### `frontend-user/src/assets/`
រូបភាព (PNG/SVG), fonts (Moul, Kantumruy Pro, Noto Sans Khmer), icons។ ប្រើតាម `import x from '../../assets/x.png'`។

### `frontend-user/src/features/`
**Feature modules** — មួយ folder មួយ feature, មាន JSX components, hooks, data, CSS របស់វា។ ឧទាហរណ៍៖
- `features/templates/`៖ Gallery, Preview, RoyalInvitation, useCountdown hook, templatesData (metadata)។
- `features/events/`៖ CreateEventForm (form ធំ 585 ជួរ), EventsList។
- `features/dashboard/`៖ Dashboard.jsx (សរុបស្ថិតិ) + useDashboardData (mock data + hook)។
- `features/invitation/`៖ TemplateRenderer lazy-load 4 រចនាប័ទ្ម (Classic, Floral, Luxury, Modern)។

### `frontend-user/src/layouts/`
**Layout shells** — UI wrapper មាន Header/Footer/Sidebar សម្រាប់ route groups។
- `MarketingShell`៖ Header (logo, nav, login button) + Footer។
- `AuthShell`៖ Minimal layout (មិនមាន header/footer)។
- `HostShell`៖ Sidebar (Aside) + main content area សម្រាប់ dashboard។
- `AdminShell`៖ AdminSidebar + main content សម្រាប់ admin pages។

### `frontend-user/src/pages/`
**Page wrappers** — file ស្តើង (5-15 ជួរ) ដែលគ្រាន់តែ render feature component។ ឧទាហរណ៍៖

```jsx
// pages/host/DashboardPage.jsx
import Dashboard from "../../features/dashboard/Dashboard";
export default function DashboardPage() {
  return <Dashboard />;
}
```

Pages គឺជា bridge ពី route ទៅ feature, មិនមាន business logic ច្រើនទេ។

### `frontend-user/src/shared/`
**Code reusable** — អ្វីដែលប្រើច្រើនជាង 1 feature៖
- `shared/api/client.js`៖ `fetch` wrapper មាន base URL, error handling។
- `shared/hooks/`៖ `useToggle`, `useLenis`, `useImageSlider`, `useHeroAnimation`, `usePrefersReducedMotion`។
- `shared/ui/`៖ Reusable components ដូចជា Button, GlassCard, MagicCard, Spinner, TimePicker, Toaster, ScrollReveal, PageTransition, AnimatedButton។
- `shared/motion/variants.js`៖ Framer Motion configs (`fadeUp`, `staggerContainer`, `pageTransition`)។
- `shared/services/`៖ `authService`, `eventService`, `guestService` (មិនទាន់ Connect ទៅ backend ពេញលេញ)។

### `frontend-user/src/lib/supabase.ts`
បង្កើត Supabase client ដោយប្រើ env vars `VITE_SUPABASE_URL` និង `VITE_SUPABASE_PUBLISHABLE_KEY`។

### `frontend-user/src/mocks/inMemoryDb.js`
Mock data សម្រាប់ test ក្នុង frontend (មុនពេល backend ready)។

### `backend/src/main/java/com/koupreng/backend/`
Spring Boot source — entities, controllers, services, security filters, WAF។

### `supabase/`
- `config.toml`៖ Supabase project config (local + linked project)។
- `migrations/`៖ SQL migration files (Flyway-style)។

### `runGit/`
Shell + batch scripts ជំនួយ git push/pull សម្រាប់ developer ដែលប្រើ Windows/Linux។

---

## 5. File សំខាន់ៗ

### Entry points
- **`frontend-user/src/main.jsx`**៖ React mount។
- **`frontend-user/src/app/App.jsx`**៖ Application wrapper។
- **`backend/src/main/java/com/koupreng/backend/BackendApplication.java`**៖ Spring Boot main។

### Routing
- **`frontend-user/src/app/router.jsx`**៖ កំណត់ route ទាំងអស់ដោយប្រើ React Router។ មាន 4 group៖ Marketing, Auth, Host, Admin។ ប្រើ `AnimatePresence` + `PageTransition` សម្រាប់ animate ចេញចូល page។

### Layout
- **`layouts/MarketingShell.jsx`**៖ Header + Footer wrapper។
- **`layouts/HostShell.jsx`**៖ Aside (sidebar) + outlet។
- **`layouts/AdminShell.jsx`**៖ AdminSidebar + outlet។

### Components សំខាន់
- **`features/templates/TemplatesGallery.jsx`**៖ បង្ហាញ list templates។
- **`features/templates/ClassicPreview.jsx`**៖ Preview phone-frame មាន auto-scroll + drag-to-scroll។
- **`features/events/CreateEventForm.jsx`**៖ Form ធំបង្កើតព្រឹត្តិការណ៍ (multi-step៖ theme → details)។
- **`features/dashboard/Dashboard.jsx`**៖ Dashboard host មាន summary cards, guest table, donut chart, expense chart។

### Config files
- **`frontend-user/vite.config.js`**៖ Vite + React + Tailwind plugin។
- **`frontend-user/eslint.config.js`**៖ ESLint rules។
- **`backend/pom.xml`**៖ Maven dependencies (Spring Boot starters)។
- **`supabase/config.toml`**៖ Supabase config។
- **`.env` / `.env.example`**៖ Environment variables (URLs, keys)។

### API / Service files
- **`frontend-user/src/shared/api/client.js`**៖ `fetch` wrapper (`api.get`, `api.post`, `api.put`, `api.delete`)។
- **`frontend-user/src/shared/api/errors.js`**៖ `ApiError` class។
- **`frontend-user/src/shared/services/authService.js`**៖ Login/register/logout endpoints។
- **`frontend-user/src/shared/services/eventService.js`**៖ CRUD weddings។
- **`frontend-user/src/shared/services/guestService.js`**៖ CRUD guests។
- **`frontend-user/src/lib/supabase.ts`**៖ Supabase client។
- **Backend controllers**៖ `HealthController`, `UserController`, `AdminUserController`។

### Style files
- **`frontend-user/src/index.css`**៖ Global (imports fonts + Tailwind)។
- **`frontend-user/src/assets/fonts/fonts.css`**៖ Google Fonts (Moul, Kantumruy Pro, Noto Sans Khmer)។
- **Page CSS**៖ `pages/marketing/HomePage.css`, `pages/auth/AuthPage.css`។
- **Feature CSS**៖ `features/events/EventsPage.css`, `features/dashboard/Dashboard.css`, ...។

---

## 6. Data Flow / Page Flow

### Application boot flow

```txt
index.html (#root)
   ↓
main.jsx  ──→ ReactDOM.createRoot
   ↓
app/App.jsx
   ↓
<ThemeProvider>
   ↓
<AuthProvider>           ← state: user, isAuthenticated
   ↓
<Router>                 ← React Router
   ↓
<AppRouter>              ← app/router.jsx
   ↓
<AnimatePresence>        ← Framer Motion
   ↓
<Routes>
   ├── MarketingShell → HomePage / PricingPage / VenuesPage / TemplatesPage
   ├── AuthShell      → LoginPage / RegisterPage / ForgotPasswordPage
   ├── HostShell      → DashboardPage / EventsPage / GuestsPage / ...
   └── AdminShell     → AdminDashboardPage / UsersPage / TemplatesPage
```

### Template browsing flow

```txt
/templates                     (gallery)
   ↓ click "មើលលម្អិត"
/templates/:id                 (ClassicPreview — phone frame, countdown)
   ↓ click "មើលការអញ្ជើញពេញលេញ"
/templates/:id/preview         (PreviewWedding — full screen)
```

### Create event flow

```txt
/templates
   ↓ click "ប្រើគំរូនេះ"
/events/create?template=:id
   ↓
CreateEventForm (step="details" because template URL param present)
   ↓ submit
onCreated() → navigate("/dashboard")
```

### Auth flow

```txt
LoginPage
   ↓ submit form
supabase.auth.signInWithPassword({ email, password })
   ↓ success
navigate("/dashboard")
```

Google OAuth:
```txt
LoginPage → click "បន្តជាមួយ Google"
   ↓
supabase.auth.signInWithOAuth({ provider: "google", redirectTo: "/dashboard" })
```

### Component → API flow (ការគ្រោងទុក)

```txt
React component
   ↓ call
shared/services/eventService.js
   ↓ call
shared/api/client.js (fetch wrapper)
   ↓ HTTP request
backend Spring Boot REST API
   ↓ JPA
PostgreSQL (via Supabase)
```

---

## 7. របៀប Run Project

### Prerequisite
- **Node.js** v18+ (សម្រាប់ frontend)
- **npm** (មកជាមួយ Node)
- **Java 25** (សម្រាប់ backend)
- **Maven Wrapper** (មកជាមួយ project: `./mvnw`)
- **Supabase account** + env vars (មើល `.env.example`)

### Frontend (frontend-user)

```bash
cd frontend-user
npm install              # install dependencies
npm run dev              # dev server (http://localhost:5173)
npm run build            # build production → dist/
npm run preview          # preview production build
npm run lint             # រត់ ESLint
```

### Frontend (frontend-admin)
ដូចគ្នាជាមួយ frontend-user៖

```bash
cd frontend-admin
npm install
npm run dev
```

### Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run               # រត់ server (Linux/Mac)
mvnw.cmd spring-boot:run             # Windows
./mvnw clean package                 # build JAR
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

Default port៖ **8080** (តាម Spring Boot default)។

### Supabase (local)

```bash
supabase start                       # ត្រូវ install Supabase CLI មុន
supabase db push                     # apply migrations
```

### Env Variables (`.env`)
ត្រូវ copy `.env.example` → `.env` (ឬ `.env.local` ក្នុង frontend) ហើយ fill values៖

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJxxx...
```

---

## 8. របៀបកែ Project

### បន្ថែម Page ថ្មី (ឧ. `/about`)

1. បង្កើត file `frontend-user/src/pages/marketing/AboutPage.jsx`៖

```jsx
export default function AboutPage() {
  return (
    <div className="about-page">
      <h1>អំពីយើង</h1>
      <p>Koupreng គឺ...</p>
    </div>
  );
}
```

2. បន្ថែម route ក្នុង `src/app/router.jsx`៖

```jsx
import AboutPage from "../pages/marketing/AboutPage";

// ក្នុង <Route element={<MarketingShell />}>
<Route
  path="/about"
  element={
    <PageTransition>
      <AboutPage />
    </PageTransition>
  }
/>
```

3. បន្ថែម link ក្នុង `layouts/components/Header.jsx`៖

```jsx
<Link to="/about" className="nav-link">អំពីយើង</Link>
```

### បន្ថែម Component ថ្មី

ប្រសិនបើ component ប្រើ feature តែមួយ → ដាក់ក្នុង feature folder។
ប្រសិនបើ component ប្រើច្រើនកន្លែង → ដាក់ `src/shared/ui/`។

ឧទាហរណ៍ Badge reusable៖

```jsx
// src/shared/ui/Badge.jsx
export function Badge({ children, color = "blue" }) {
  return (
    <span className={`px-2 py-1 rounded text-sm bg-${color}-100 text-${color}-700`}>
      {children}
    </span>
  );
}
```

ប្រើ៖

```jsx
import { Badge } from "../../shared/ui/Badge";
<Badge color="green">បានបញ្ជាក់</Badge>
```

### បន្ថែម Hook ថ្មី

- Hook ប្រើច្រើនកន្លែង → `src/shared/hooks/useX.js`
- Hook ប្រើ feature តែមួយ → `src/features/<feature>/useX.js`

ឧទាហរណ៍៖

```js
// src/shared/hooks/useDebounce.js
import { useEffect, useState } from "react";

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
```

### កែ Style

- **Global style**៖ កែ `src/index.css`។
- **Component style**៖ ប្រើ Tailwind classes ផ្ទាល់ក្នុង JSX, ឬកែ CSS file ក្បែរ component។
- **Theme color/font**៖ កែក្នុង `src/assets/fonts/fonts.css` ឬ Tailwind config (បើមាន)។

### កែ Content / Text

ភាគច្រើនជា hard-coded ក្នុង JSX។ ស្វែងរក text ដោយ Ctrl+F ក្នុង IDE រួចកែ។ ឧទាហរណ៍៖

```jsx
// pages/marketing/HomePage.jsx
<h1 className="khmer-title">រៀបចំពិធីមង្គលការ</h1>
```

### បន្ថែម Image / Asset

1. Copy file ទៅ `src/assets/icons/` ឬ `src/assets/`។
2. Import ក្នុង JSX៖

```jsx
import myImage from "../../assets/icons/my-image.png";
<img src={myImage} alt="..." />
```

3. ឬប្រសិនបើជា static asset (មិន import) → ដាក់ក្នុង `public/` ហើយប្រើ path `/my-image.png`។

---

## 9. ចំណុចដែលអាចកែលម្អបន្ត

### Code quality
- **Duplicate code**៖ `EyeIcon` SVG-pair ស្ទួនក្នុង `LoginPage.jsx`, `RegisterPage.jsx`, `ForgotPasswordPage.jsx` → គួរ extract ទៅ `shared/ui/EyeIcon.jsx`។
- **Dead code**៖ `src/App.jsx` + `src/App.css` ជា Vite scaffold ស្ទួន, មិនត្រូវបានប្រើ (`main.jsx` import ពី `./app/App`) → លុបបាន។
- **frontend-admin** នៅជា Vite scaffold ដំបូង មិនទាន់មាន feature ពិត។
- **ClassicPreview.jsx** មាន logic auto-scroll + drag ~110 ជួរ → គួរ extract ទៅ hook `usePhonePreviewScroll`។
- **CreateEventForm.jsx** ធំ 585 ជួរ → អាចបំបែកជា sub-components ឬ extract state ទៅ hook។

### Feature ត្រូវបន្ថែម
- **Backend connection**៖ `shared/services/*.js` បាន setup ប៉ុន្តែមិនទាន់ប្រើពិតប្រាកដ — frontend នៅប្រើ mock data។
- **RequireAuth route guard**៖ មាន file តែមិនត្រូវបាន apply ក្នុង router.jsx → routes host/admin គ្មាន protection។
- **Reset password flow**៖ `ResetPasswordPage.jsx` មាន file តែគ្មាន route។
- **Real-time RSVP**៖ Supabase subscription សម្រាប់ភ្ញៀវ confirm។
- **PDF export**៖ Dashboard បង្ហាញ "នាំចេញ PDF" តែមិនទាន់ implement។
- **QR code generator**៖ មាន label "QR Code" តែមិនទាន់ implement។

### UX / UI
- **Loading states**៖ Pages ច្រើនមិនមាន skeleton/spinner ពេល fetch។
- **Error handling**៖ Form submit គ្រាន់តែ `setError(authError.message)` — គួរបង្ហាញ toast/banner ស្អាត។
- **Responsive design**៖ ត្រូវ test page sizes ច្រើនជាង (mobile, tablet, desktop, ultra-wide)។
- **Accessibility (a11y)**៖ ត្រូវបន្ថែម `aria-*` attributes ច្រើនទៀត, keyboard navigation, focus states។
- **Dark mode**៖ ThemeContext មាន `toggleTheme` តែ UI មិនទាន់មាន toggle button + dark styles។

### Performance
- **Code splitting**៖ Build warning "chunks larger than 500 kB" → ត្រូវប្រើ `React.lazy()` + `Suspense` លើ page routes។
- **Image optimization**៖ `background.png` 2.5MB → ត្រូវ compress + ប្រើ WebP/AVIF។
- **Bundle analysis**៖ ដំឡើង `rollup-plugin-visualizer` ដើម្បីមើល dependency size។

### SEO
- **Meta tags**៖ `index.html` មាន title ស្តង់ដារ Vite → ត្រូវ custom + Open Graph។
- **React Helmet** ឬ react-router meta loader សម្រាប់ per-page title/description។
- **Sitemap.xml + robots.txt** ក្នុង `public/`។

### Security
- **Env vars**៖ `.env` បាន commit (មាននៅក្នុង git tree) → គួរ rotate keys + add ទៅ `.gitignore`។
- **Backend** មាន WAF filter + JWT validation + rate limiting (Redis) → ល្អប្រសើរ។

### Testing
- **គ្មាន test files** ក្នុង frontend → គួរបន្ថែម Vitest + React Testing Library។
- **Backend** មាន `src/test/java/` empty → ត្រូវសរសេរ JUnit tests។

### DX (Developer Experience)
- **Storybook** សម្រាប់ `shared/ui` components។
- **TypeScript migration**៖ ភាគច្រើនជា `.jsx`, មាន 1 file `.ts` (`supabase.ts`) → អាច migrate បន្តិចម្តងៗ។
- **Pre-commit hook** (husky + lint-staged) ដើម្បីបង្ខំ ESLint។

---

## សេចក្ដីសន្និដ្ឋាន

Project នេះជា full-stack wedding invitation platform មាន 3 ផ្នែកធំ (frontend-user, frontend-admin, backend) + Supabase សម្រាប់ auth/storage។

ផ្នែកដែលធ្វើរួចជាង៖
- ✅ frontend-user marketing pages (Home, Pricing, Venues)
- ✅ Template gallery + preview
- ✅ Host dashboard UI (មាន mock data)
- ✅ Login/Register/Forgot password flow (Supabase auth)
- ✅ Backend security infrastructure (WAF, JWT, rate limiting)

ផ្នែកដែលនៅសល់៖
- ⏳ Connect frontend ↔ backend (services មាន, តែមិនទាន់ប្រើ)
- ⏳ frontend-admin (នៅជា scaffold)
- ⏳ Protected routes (RequireAuth មិន apply)
- ⏳ Tests
- ⏳ Production deployment

---

*ឯកសារនេះត្រូវបានបង្កើតដោយស្វ័យប្រវត្តិ ដើម្បីជួយ developer ថ្មីចូលរួម project។ បើមានចំណុចមិនច្បាស់ សូមមើល `README.md` ឬសួរ team lead។*
