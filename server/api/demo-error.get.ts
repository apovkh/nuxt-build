// Демо-ендпоінт: навмисно повертає заданий HTTP-статус (?status=…).
// Живить сторінку /errors — показ обробки помилок для різних типів запитів.

// Людські повідомлення для кожного статусу. Ідуть у JSON-тіло (UTF-8), тож кирилиця
// коректна — на відміну від statusMessage, що потрапляє в ASCII-only reason phrase
// і був би спотворений. normalizeApiError дістає текст саме з тіла (err.data.message).
const STATUS_MESSAGES: Record<number, string> = {
  400: 'Некоректний запит',
  401: 'Не авторизовано',
  403: 'Доступ заборонено',
  404: 'Ресурс не знайдено',
  422: 'Дані не пройшли валідацію',
  500: 'Внутрішня помилка сервера',
}

export default defineEventHandler((event) => {
  const status = Number(getQuery(event).status) || 200

  // Без статусу (або 200) — успішна відповідь.
  if (status === 200) {
    return { ok: true, message: 'Запит успішний' }
  }

  // 422 → сирий масив [field, rule, params] як УСЕ тіло відповіді: саме цей формат
  // useForm мапить у помилки полів (error.data.forEach). Тут валиться лише email.
  if (status === 422) {
    setResponseStatus(event, 422)
    return [['email', 'email', []]]
  }

  // Решта статусів — через createError: message летить у тіло (err.data.message),
  // звідки його дістає normalizeApiError. statusMessage не задаємо навмисно —
  // h3 радить message для довгих текстів (reason phrase лишається стандартним).
  const message = STATUS_MESSAGES[status] ?? `Помилка ${status}`
  throw createError({ statusCode: status, message, data: { message } })
})
