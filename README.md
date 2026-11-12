# SHORA LINE — Домашняя караоке-система

**Shora Line** — полноценная домашняя караоке-система для мини-ПК / домашнего компьютера с управлением с Android TV / Google TV и смартфонов в локальной сети (Wi-Fi / Ethernet).

## Ключевые возможности
- **Двойной режим воспроизведения**: локальные видеофайлы (`MP4 H.264 + AAC`, `WebM`, `MKV`) с HTTP Range Requests (`206 Partial Content`) без интернета + официальный **YouTube IFrame Player API**.
- **Интеллектуальный поиск RU / KZ**: нормализация и транслитерация казахских букв (`Ә, Ғ, Қ, Ң, Ө, Ұ, Ү, Һ, І`) и русских названий (`Кайрат Нуртас` ↔ `Қайрат Нұртас`, `Димаш Кудайберген` ↔ `Димаш Құдайберген`, `Музарт` ↔ `МұзАРТ`).
- **6-этапный конвейер поиска**: локальная библиотека → ранее просмотренные YouTube → YouTube Data API v3 → объединение и дедупликация → сортировка по релевантности с приоритетом локальных файлов.
- **Синхронизация в реальном времени (SSE)**: очередь, воспроизведение, громкость, повтор и одноразовый QR-код подключения обновляются мгновенно между ТВ, ПК и смартфонами.
- **Android TV / Google TV Mode (`/tv`)**: крупные шрифты для 3–5 метров, навигация стрелками пульта + `OK` / `Back`, встроенная экранная клавиатура (`ҚАЗ` / `РУС` / `EN`).
- **Управление с телефона (`/remote`)**: мобильный PWA-пульт с подключением по QR-коду и одноразовому коду сессии.
- **Админ-панель и Статистика (`/admin`)**: загрузка файлов и папок, SHA-256 контроль дубликатов, сканирование каталога, резервные копии, логи и аналитика.

## Структура проекта
```text
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Главная страница (поиск, плеер, очередь, история, избранное)
│   │   ├── tv/page.tsx               # Android TV / Google TV режим
│   │   ├── remote/page.tsx           # Пульт управления со смартфона (PWA)
│   │   ├── admin/page.tsx            # Панель администратора и статистика
│   │   └── api/                      # Next.js API Route Handlers (search, videos Range, SSE, queue, admin)
│   ├── components/                   # UI компоненты (KaraokePlayer, TvModeStage, MobileRemoteClient, AdminDashboard)
│   ├── db/                           # Drizzle ORM + PostgreSQL схема (src/db/schema.ts)
│   └── lib/                          # RU/KZ i18n, транслитерация, YouTube API, SHA-256 хранилище, SSE, auth
├── public/                           # PWA manifest, Service Worker (sw.js), локальные иконки
├── installer/                        # Установщик Windows (.nsi, PowerShell bootstrapper, иконка и ShoraLine-Setup.exe)
├── scripts/                          # Скрипты Windows настройки, сборки .exe, остановки и резервного копирования
├── docs/                             # Подробные инструкции по Windows, YouTube API, Android TV и смартфону
├── tests/                            # Автоматические тесты (node --test)
├── start-karaoke.bat                 # Запуск на Windows двойным щелчком
├── docker-compose.yml                # Развертывание PostgreSQL + Shora Line
└── .env.example                      # Шаблон переменных окружения
```

## Быстрый старт
См. инструкции в папке `docs/`:
- [Установка на Windows 10/11](docs/WINDOWS-SETUP.md)
- [Настройка и ограничения YouTube API](docs/YOUTUBE-API.md)
- [Подключение Android TV / Google TV](docs/ANDROID-TV.md)
- [Управление со смартфона](docs/MOBILE-REMOTE.md)
