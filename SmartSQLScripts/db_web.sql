-- ========================== Creates the web Schema =================
create schema web;


----------------------------------------------------------------------
-- translation_keys table
----------------------------------------------------------------------
drop table if exists web.translation_keys;

CREATE TABLE web.translation_keys
(
  key character varying(200) NOT NULL,
  namespace character varying(100),
  CONSTRAINT pk_keys PRIMARY KEY (key)
);


----------------------------------------------------------------------
-- translations table
----------------------------------------------------------------------
drop table if exists web.translations;

CREATE TABLE web.translations
(
  language character(2) NOT NULL,
  key character varying(200) NOT NULL,
  translation text,
  CONSTRAINT pk_translations PRIMARY KEY (key, language),
  CONSTRAINT fk_key FOREIGN KEY (key) REFERENCES web.translation_keys (key)
);
