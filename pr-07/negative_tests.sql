-- CampusHub: негативні сценарії. Запускати після schema.sql і seed.sql.
-- Кожна перевірка — у власній транзакції з ROLLBACK, тому seed не змінюється.
-- Помилки очікувані: у виводі шукайте рядки ERROR.

\echo
\echo '=== 1. Користувач із наявним email (очікується: помилка UNIQUE) ==='
BEGIN;
INSERT INTO users (name, email) VALUES ('Дублікат', 'olena@campus.example');
ROLLBACK;

\echo
\echo '=== 2. Повторна реєстрація на ту саму подію (очікується: помилка UNIQUE) ==='
BEGIN;
INSERT INTO registrations (user_id, event_id)
SELECT u.id, e.id
FROM users u, events e
WHERE u.email = 'olena@campus.example' AND e.title = 'Вступ до SQL';
ROLLBACK;

\echo
\echo '=== 3. Подія з capacity = 0 (очікується: помилка CHECK) ==='
BEGIN;
INSERT INTO events (title, starts_at, ends_at, capacity, category_id)
SELECT 'Нульова місткість', now() + INTERVAL '1 day', now() + INTERVAL '2 days', 0, id
FROM categories WHERE name = 'Бази даних';
ROLLBACK;

\echo
\echo '=== 4. Завершення події раніше початку (очікується: помилка CHECK) ==='
BEGIN;
INSERT INTO events (title, starts_at, ends_at, capacity, category_id)
SELECT 'Кінець раніше початку', now() + INTERVAL '2 days', now() + INTERVAL '1 day', 10, id
FROM categories WHERE name = 'Бази даних';
ROLLBACK;

\echo
\echo '=== 5. Реєстрація для неіснуючої події (очікується: помилка зовнішнього ключа) ==='
BEGIN;
INSERT INTO registrations (user_id, event_id)
SELECT id, 999999 FROM users WHERE email = 'olena@campus.example';
ROLLBACK;

\echo
\echo '=== 6. Видалення категорії з подіями (очікується: блокується, RESTRICT) ==='
BEGIN;
DELETE FROM categories WHERE name = 'Програмування';
ROLLBACK;

\echo
\echo '=== 7. Видалення події: реєстрації та матеріали видаляються (CASCADE) ==='
BEGIN;
\echo 'До видалення (очікується: events 6, registrations 9, materials 4):'
SELECT (SELECT count(*) FROM events)        AS events,
       (SELECT count(*) FROM registrations) AS registrations,
       (SELECT count(*) FROM materials)     AS materials;

DELETE FROM events WHERE title = 'Вступ до SQL';

\echo 'Після видалення "Вступ до SQL" (очікується: events 5, registrations 7, materials 2):'
SELECT (SELECT count(*) FROM events)        AS events,
       (SELECT count(*) FROM registrations) AS registrations,
       (SELECT count(*) FROM materials)     AS materials;

\echo 'Осиротілі рядки (очікується: 0 і 0):'
SELECT (SELECT count(*) FROM registrations r LEFT JOIN events e ON e.id = r.event_id WHERE e.id IS NULL) AS orphan_registrations,
       (SELECT count(*) FROM materials m     LEFT JOIN events e ON e.id = m.event_id WHERE e.id IS NULL) AS orphan_materials;
ROLLBACK;

\echo
\echo '=== 8. Додатково: видалення користувача видаляє його реєстрації (CASCADE) ==='
BEGIN;
\echo 'Реєстрацій Олени до видалення (очікується 3):'
SELECT count(*) FROM registrations r JOIN users u ON u.id = r.user_id WHERE u.email = 'olena@campus.example';
DELETE FROM users WHERE email = 'olena@campus.example';
\echo 'Усього реєстрацій після (очікується 6) і подій (лишається 6):'
SELECT (SELECT count(*) FROM registrations) AS registrations,
       (SELECT count(*) FROM events)        AS events;
ROLLBACK;

\echo
\echo '=== 9. Додатково: email у верхньому регістрі (очікується: помилка CHECK) ==='
BEGIN;
INSERT INTO users (name, email) VALUES ('Регістр', 'NEW@Campus.Example');
ROLLBACK;

\echo
\echo '=== Перевірка: seed не змінився (очікується: 4, 3, 6, 9, 4) ==='
SELECT (SELECT count(*) FROM users)         AS users,
       (SELECT count(*) FROM categories)    AS categories,
       (SELECT count(*) FROM events)        AS events,
       (SELECT count(*) FROM registrations) AS registrations,
       (SELECT count(*) FROM materials)     AS materials;
