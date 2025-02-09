CREATE TABLE "media" (
    "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "uri" VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE "persons" (
    "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY NOT NULL,
    "person_name" VARCHAR(255) NOT NULL,
    "uri" VARCHAR(255) NOT NULL,
    "self_identity" VARCHAR
);

CREATE TABLE "roles" (
    "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "uri" VARCHAR(255) NOT NULL
);

CREATE TABLE "collaborators" (
    "media_id" INTEGER NOT NULL,
    "person_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL
);

CREATE TABLE "media_sources" (
    "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "media_id" INTEGER NOT NULL,
    "web_link" TEXT UNIQUE NOT NULL,
    "release_date" date DEFAULT null,
    "paywall_id" INTEGER NOT NULL,
    "paywall_cost" integer DEFAULT NULL
);

CREATE TABLE "paywalls" (
    "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "uri" varchar UNIQUE NOT NULL
);

CREATE TABLE "views" (
    "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY NOT NULL,
    "media_source_id" integer NOT NULL,
    "scan_date" timestamptz NOT NULL,
    "views_count" INTEGER DEFAULT 0
);

CREATE TABLE "raiting" (
    "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY NOT NULL,
    "person_id" integer NOT NULL,
    "media_id" integer NOT NULL,
    "media_raiting" integer DEFAULT null
);

ALTER TABLE "raiting" ADD FOREIGN KEY ("person_id") REFERENCES "persons" ("id");

ALTER TABLE "raiting" ADD FOREIGN KEY ("media_id") REFERENCES "media" ("id");

ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_id_media_foreign" FOREIGN KEY ("media_id") REFERENCES "media" ("id");

ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_id_role_foreign" FOREIGN KEY ("role_id") REFERENCES "roles" ("id");

ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_id_person_foreign" FOREIGN KEY ("person_id") REFERENCES "persons" ("id");

ALTER TABLE "media_sources" ADD CONSTRAINT "media_sources_id_media_foreign" FOREIGN KEY ("media_id") REFERENCES "media" ("id");

ALTER TABLE "media_sources" ADD CONSTRAINT "paywall_id_media_sources" FOREIGN KEY ("paywall_id") REFERENCES "paywalls" ("id");

ALTER TABLE "views" ADD CONSTRAINT "views_id_media_sources" FOREIGN KEY ("media_source_id") REFERENCES "media_sources" ("id");