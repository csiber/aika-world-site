-- AIKA WORLD — Marketplace Migration
-- Adds trading table for player-to-player commerce.

CREATE TABLE IF NOT EXISTS market_offers (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  planet_id     TEXT NOT NULL REFERENCES planets(id) ON DELETE CASCADE,
  offer_res     TEXT NOT NULL, -- 'metal', 'crystal', 'deus'
  offer_amt     REAL NOT NULL,
  seek_res      TEXT NOT NULL, -- 'metal', 'crystal', 'deus'
  seek_amt      REAL NOT NULL,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  status        TEXT NOT NULL DEFAULT 'open' -- 'open', 'done', 'cancelled'
);

CREATE INDEX IF NOT EXISTS idx_market_open ON market_offers(status, created_at DESC);
