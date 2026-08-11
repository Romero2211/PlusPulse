# Деплой PlusPulse на Vercel

Проєкт використовує **PostgreSQL** (Prisma). SQLite більше не підтримується.

## 1. База даних — Neon (поточний)

Проєкт використовує **Neon PostgreSQL**. Потрібні два URL з Neon Console → **Connection details**:

| Змінна | Підключення в Neon |
|--------|---------------------|
| `DATABASE_URL` | **Pooled** (хост містить `-pooler`) |
| `DIRECT_DATABASE_URL` | **Direct** (той самий хост **без** `-pooler`) |

Обидва з `?sslmode=require`. Міграція `20260810180000_init_postgresql` уже застосована до бази `neondb`.

### Vercel Postgres (альтернатива)

1. У проєкті Vercel: **Storage → Create Database → Postgres**.
2. Підключіть БД до проєкту — Vercel додасть змінні середовища.
3. У **Settings → Environment Variables** перейменуйте або додайте:

| Змінна Vercel | Призначення |
|---------------|-------------|
| `POSTGRES_PRISMA_URL` | → `DATABASE_URL` (pooled, для застосунку) |
| `POSTGRES_URL_NON_POOLING` | → `DIRECT_DATABASE_URL` (для `prisma migrate deploy`) |

Або вручну скопіюйте значення з панелі Storage у ці дві змінні.

---

## 2. Змінні середовища на Vercel

Обов’язкові:

```env
DATABASE_URL=postgresql://...
DIRECT_DATABASE_URL=postgresql://...
AUTH_SECRET=<мінімум 32 символи, openssl rand -base64 32>
ADMIN_EMAILS=admin@yourdomain.org
```

Опційні:

```env
GEMINI_API_KEY=...
EVENT_AI_DISABLED=1
```

---

## 3. Деплой

1. Пуште репозиторій на GitHub.
2. Імпортуйте проєкт у [Vercel](https://vercel.com).
3. Framework Preset: **Next.js** (визначиться автоматично).
4. Build Command (у `vercel.json` вже налаштовано):

   ```
   prisma generate && prisma migrate deploy && next build
   ```

5. Deploy.

Після першого успішного деплою зареєструйте адмін-акаунт на `/register` з email з `ADMIN_EMAILS`.

---

## 4. Локальна розробка

Якщо в `.env` налаштовано Neon — достатньо:

```bash
npm run dev
```

Для локального Docker Postgres (без Neon):

```bash
npm run db:up
# у .env — localhost:5433 (див. .env.example)
npm run db:migrate:deploy
npm run dev
```

Зупинити локальну БД: `npm run db:down`

---

## 5. Завантаження файлів (важливо)

На Vercel **локальний диск не persistent** — завантаження в `public/uploads/` **не зберігаються** між деплоями та інстансами.

Для production потрібно підключити зовнішнє сховище:

- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- Cloudflare R2
- AWS S3

До підключення blob-storage адмін-завантаження обкладинок новин/зборів на Vercel працюватимуть нестабільно.

---

## 6. Міграція з SQLite

Якщо у вас були дані в `prisma/dev.db`:

1. Експорт: `sqlite3 prisma/dev.db .dump > dump.sql` (потрібна ручна адаптація під PostgreSQL).
2. Або створіть контент заново через адмінку після деплою.

Нова baseline-міграція: `prisma/migrations/20260810180000_init_postgresql/`.

---

## 7. Перевірка після деплою

- [ ] Головна, новини, збори відкриваються
- [ ] Login / register
- [ ] `/admin` доступний лише для `ADMIN_EMAILS`
- [ ] Форма контактів зберігає повідомлення
- [ ] `AUTH_SECRET` заданий (без нього prod падає)
