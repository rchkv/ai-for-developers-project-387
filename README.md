# Календарь звонков (продолжение)


[![hexlet-check](https://github.com/rchkv/ai-for-developers-project-387/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/rchkv/ai-for-developers-project-387/actions)

Интегрируйте работу агентов в GitHub проект

Учебный проект Хекслета: https://ru.hexlet.io/programs/ai-for-developers
Как это должно работать: https://files.hexlet.app/a/2ipc5m

@requirements.md

## Деплой

Приложение задеплоено на Render:
**https://ai-for-developers-project-386-yq3r.onrender.com**

Оно разворачивается как один web-сервис:
корневой `Dockerfile` собирает UI и отдаёт его вместе с API с одного порта.
Конфигурация описана в [`render.yaml`](./render.yaml).

Сразу после первого деплоя маршрутизация Render может несколько минут отдавать
404 с заголовком `x-render-routing: no-server` — это ожидаемо и проходит само,
рестарт сервиса не нужен.
