# Швидкий старт

## Встановлення

1. **Встановіть Node.js** (якщо ще не встановлено)
   - Завантажте з [nodejs.org](https://nodejs.org/)
   - Потрібна версія 18 або вище

2. **Встановіть залежності проекту:**
   ```bash
   cd PlusPulse
   npm install
   ```

3. **Запустіть dev сервер:**
   ```bash
   npm run dev
   ```

4. **Відкрийте браузер:**
   - Перейдіть на [http://localhost:3000](http://localhost:3000)
   - Сайт автоматично оновлюватиметься при зміні коду

## Структура проекту

- `app/` - Next.js App Router (головна сторінка та layout)
- `components/` - React компоненти (Header, Hero, About, тощо)
- `contexts/` - React контексти (управління мовою)
- `package.json` - залежності та скрипти
- `next.config.js` - конфігурація Next.js
- `tsconfig.json` - конфігурація TypeScript

## Основні команди

```bash
npm run dev      # Запуск dev сервера
npm run build    # Збірка для production
npm start        # Запуск production сервера
npm run lint     # Перевірка коду
```

## Підтримка мов

Сайт підтримує українську та англійську мови. Мова зберігається в localStorage браузера.

Переклади знаходяться в `contexts/LanguageContext.tsx`.

## Деплой

### Vercel (найпростіший спосіб)

1. Завантажте код на GitHub
2. Перейдіть на [vercel.com](https://vercel.com)
3. Імпортуйте репозиторій
4. Vercel автоматично визначить Next.js і збере проект

### Інші платформи

```bash
npm run build
# Потім завантажте папку .next на ваш сервер
```

## Проблеми?

Якщо виникають проблеми:

1. Перевірте версію Node.js: `node --version` (потрібна 18+)
2. Видаліть `node_modules` та `package-lock.json` і запустіть `npm install` знову
3. Перевірте, чи всі файли на місці
