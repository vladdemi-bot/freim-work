-- CampusHub: тестові дані. Запускати після schema.sql.
-- Дати події задано відносно поточного часу, тому "майбутні" й "минулі" події
-- залишаються такими незалежно від дня запуску.
-- Порядок: users, categories -> events -> registrations, materials.

-- Користувачі (4) — email у нижньому регістрі
INSERT INTO users (name, email) VALUES
  ('Олена Коваль',     'olena@campus.example'),
  ('Іван Петренко',    'ivan@campus.example'),
  ('Марія Шевченко',   'maria@campus.example'),
  ('Андрій Бондаренко','andrii@campus.example');

-- Категорії (3)
INSERT INTO categories (name) VALUES
  ('Програмування'),
  ('Бази даних'),
  ('Кар’єра');

-- Події (6): 2 минулі, 4 майбутні; одна без опису
INSERT INTO events (title, description, starts_at, ends_at, capacity, category_id)
SELECT v.title,
       v.description,
       date_trunc('hour', CURRENT_TIMESTAMP) + v.shift,
       date_trunc('hour', CURRENT_TIMESTAMP) + v.shift + v.duration,
       v.capacity,
       c.id
FROM (VALUES
  (1, 'Вступ до SQL',        'Таблиці, SELECT, JOIN',            INTERVAL '-14 days', INTERVAL '2 hours', 30, 'Бази даних'),    -- минула
  (2, 'Основи PostgreSQL',   'Обмеження, ключі, транзакції',     INTERVAL '3 days',   INTERVAL '3 hours',  3, 'Бази даних'),    -- майбутня, заповнена
  (3, 'Node.js для початківців', 'Перший сервер на Node.js',     INTERVAL '7 days',   INTERVAL '2 hours', 25, 'Програмування'), -- майбутня
  (4, 'Git і командна робота',   'Гілки, pull request, code review', INTERVAL '-30 days', INTERVAL '90 minutes', 20, 'Програмування'), -- минула
  (5, 'Кар’єра в IT: зустріч з випускниками', NULL,              INTERVAL '14 days',  INTERVAL '2 hours', 50, 'Кар’єра'),       -- без опису, без реєстрацій
  (6, 'REST API: майстер-клас', 'Проєктуємо ресурси та маршрути', INTERVAL '10 days',  INTERVAL '4 hours', 15, 'Програмування')  -- майбутня
) AS v(n, title, description, shift, duration, capacity, category_name)
JOIN categories c ON c.name = v.category_name
ORDER BY v.n;

-- Реєстрації (9). Жодна пара user+event не повторюється,
-- кількість реєстрацій не перевищує capacity (Основи PostgreSQL: 3 з 3).
INSERT INTO registrations (user_id, event_id, registered_at)
SELECT u.id, e.id, CURRENT_TIMESTAMP - v.ago
FROM (VALUES
  ('olena@campus.example',  'Вступ до SQL',          INTERVAL '20 days'),
  ('olena@campus.example',  'Основи PostgreSQL',     INTERVAL '5 days'),
  ('olena@campus.example',  'Node.js для початківців', INTERVAL '2 days'),
  ('ivan@campus.example',   'Вступ до SQL',          INTERVAL '19 days'),
  ('ivan@campus.example',   'Основи PostgreSQL',     INTERVAL '4 days'),
  ('ivan@campus.example',   'Git і командна робота', INTERVAL '35 days'),
  ('maria@campus.example',  'Основи PostgreSQL',     INTERVAL '3 days'),
  ('maria@campus.example',  'Node.js для початківців', INTERVAL '1 day'),
  ('andrii@campus.example', 'REST API: майстер-клас', INTERVAL '6 hours')
) AS v(email, event_title, ago)
JOIN users  u ON u.email = v.email
JOIN events e ON e.title = v.event_title;

-- Матеріали (4): "Вступ до SQL" має два
INSERT INTO materials (event_id, title, url)
SELECT e.id, v.title, v.url
FROM (VALUES
  ('Вступ до SQL',        'Презентація лекції',  'https://example.com/materials/sql-intro-slides.pdf'),
  ('Вступ до SQL',        'Запис лекції',        'https://example.com/materials/sql-intro-recording'),
  ('Основи PostgreSQL',   'Конспект',            'https://example.com/materials/postgres-notes.pdf'),
  ('Git і командна робота','Шпаргалка з Git',    'https://example.com/materials/git-cheatsheet.pdf')
) AS v(event_title, title, url)
JOIN events e ON e.title = v.event_title;
