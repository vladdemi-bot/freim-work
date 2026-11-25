-- CampusHub: п'ять запитів. Запускати після schema.sql і seed.sql.

-- Запит 1. Майбутні події: назва, дата початку, місткість.
-- Найближчі події — першими.
SELECT title, starts_at, capacity
FROM events
WHERE starts_at > CURRENT_TIMESTAMP
ORDER BY starts_at ASC;

-- Запит 2. Реєстрації конкретного користувача (user_id = 1, Олена Коваль):
-- ім'я користувача, назва події, дата початку події, дата реєстрації.
-- Для іншого користувача змініть число в умові WHERE.
SELECT u.name         AS user_name,
       e.title        AS event_title,
       e.starts_at    AS event_starts_at,
       r.registered_at
FROM registrations r
JOIN users  u ON u.id = r.user_id
JOIN events e ON e.id = r.event_id
WHERE u.id = 1
ORDER BY e.starts_at;

-- Запит 3. Кількість реєстрацій для кожної події.
-- LEFT JOIN залишає події без учасників; COUNT(registrations.id) для них дає 0
-- (COUNT(*) дав би 1, бо рядок події все одно існує).
SELECT e.title,
       COUNT(r.id) AS participants
FROM events e
LEFT JOIN registrations r ON r.event_id = e.id
GROUP BY e.id, e.title
ORDER BY participants DESC, e.title;

-- Запит 4. Пошук подій за назвою без урахування регістру (текст "sql").
SELECT id, title, starts_at
FROM events
WHERE title ILIKE '%sql%'
ORDER BY starts_at;

-- Запит 5. Події разом із категоріями: назва події, назва категорії, дата початку.
SELECT e.title      AS event_title,
       c.name       AS category_name,
       e.starts_at
FROM events e
JOIN categories c ON c.id = e.category_id
ORDER BY e.starts_at;
