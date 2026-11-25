-- CampusHub: схема бази даних (PostgreSQL 14+)
-- Ідентифікатори: BIGINT GENERATED ALWAYS AS IDENTITY (числові, в усіх таблицях).
-- Час: TIMESTAMPTZ.
-- Скрипт можна запускати повторно: спочатку видаляє старі таблиці.

DROP TABLE IF EXISTS materials, registrations, events, categories, users CASCADE;

-- 1. Користувачі
CREATE TABLE users (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT users_email_unique    UNIQUE (email),
  CONSTRAINT users_email_lowercase CHECK  (email = lower(email))
);

-- 2. Категорії подій
CREATE TABLE categories (
  id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,

  CONSTRAINT categories_name_unique UNIQUE (name)
);

-- 3. Події (description — необов'язкове поле)
CREATE TABLE events (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       TEXT        NOT NULL,
  description TEXT,
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ NOT NULL,
  capacity    INTEGER     NOT NULL,
  category_id BIGINT      NOT NULL,

  CONSTRAINT events_capacity_positive CHECK (capacity > 0),
  CONSTRAINT events_ends_after_starts CHECK (ends_at > starts_at),

  -- категорію, яку використовують події, видалити не можна
  CONSTRAINT events_category_fk FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE RESTRICT
);

-- 4. Реєстрації (зв'язок many-to-many між users і events)
CREATE TABLE registrations (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       BIGINT      NOT NULL,
  event_id      BIGINT      NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- один користувач — одна реєстрація на подію
  CONSTRAINT registrations_user_event_unique UNIQUE (user_id, event_id),

  CONSTRAINT registrations_user_fk FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT registrations_event_fk FOREIGN KEY (event_id)
    REFERENCES events(id)
    ON DELETE CASCADE
);

-- 5. Матеріали подій
CREATE TABLE materials (
  id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id BIGINT NOT NULL,
  title    TEXT   NOT NULL,
  url      TEXT   NOT NULL,

  CONSTRAINT materials_event_fk FOREIGN KEY (event_id)
    REFERENCES events(id)
    ON DELETE CASCADE
);

-- Індекси на зовнішні ключі (PostgreSQL не створює їх автоматично).
-- Для registrations.user_id окремий індекс не потрібен: його покриває UNIQUE (user_id, event_id).
CREATE INDEX events_category_id_idx    ON events(category_id);
CREATE INDEX registrations_event_id_idx ON registrations(event_id);
CREATE INDEX materials_event_id_idx    ON materials(event_id);
