# Comprehensive Test Commands Reference

## 1. Unit & Component Tests

```powershell
# Frontend User Vitest
cd apps/frontend-user
npm test

# Frontend Admin Vitest
cd ../frontend-admin
npm test

# Backend Maven Tests
cd ../backend
mvn test
```

## 2. Playwright E2E Tests

```powershell
cd apps/frontend-user
npx playwright test

# Run specific E2E spec with UI
npx playwright test tests/e2e/invitation.spec.js --headed
```

## 3. Python Telegram Bot Tests

```powershell
cd apps/telegram-bot
pytest -v
```

## 4. Linting & Static Code Analysis

```powershell
# Frontend User linting
npm --prefix apps/frontend-user run lint

# Frontend Admin linting
npm --prefix apps/frontend-admin run lint
```

