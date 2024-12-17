-- Reset tables
TRUNCATE TABLE persons, roles, media, raiting, collaborators, paywalls RESTART IDENTITY CASCADE;
-- Persons - people in catalog
INSERT INTO persons (person_name, uri, self_identity)
VALUES
('Илья Якямсев', 'Ilia_Iakiamsev', 'he/him'),
('Дмитрий Дедков', 'Dmitrii_Dedkov', 'he/him'),
('Ирина Мягкова', 'Irina_Miagkova', 'she/her'),
('Саша Долгополов', 'Dasha_Dolgopolov', 'she/her'),
('Иван Усович', 'Ivan_Usovich', 'he/him'),
('Сергей Орлов', 'Sergei_Orlov', 'he/him'),
('Анна Протоковило', 'Anna_Protokovilo', 'she/her'),
('аа бб', 'aa_bb', 'he/him'),
('Константин Константинопольский', 'Konstantin_Konstantinopolskii', NULL);

-- Roles - known roles
INSERT INTO roles (title, uri)
VALUES
('комик','comedian'),
('режиссёр', 'director'),
('критик', 'critic');

-- Media - an media item
INSERT INTO media (title, uri)
VALUES
('Одинёшенька', 'Odineshenka'),
('Ещё один день', 'Eshche_odin_den'),
('Самозванец', 'Samozvanets'),
('Москвич', 'Moskvich'),
('Сильная и независимая', 'Silnaia_i_nezavisimaia'),
('Час шуток Александра Долгополова', 'Chas_shutok_Aleksandra_Dolgopolova');

-- Raiting - person raitiong to media
INSERT INTO raiting (person_id, media_id, media_raiting)
VALUES
(1, 1, 10),
(1, 2, 10),
(1, 3, 9),
(1, 5, 4),
(2, 3, 5);

-- Collaborators - who participates on the media
INSERT INTO collaborators (media_id, person_id, role_id)
VALUES
(1, 2, 1),
(2, 5, 1),
(3, 6, 1),
(3, 7, 2),
(4, 1, 1),
(4, 7, 2),
(5, 3, 1),
(6, 4, 1);

-- Paywalls - where is the media
INSERT INTO paywalls (title, uri)
VALUES
('Youtube', 'youtube.com'),
('ВКонтакте', 'vk.ru');

-- Media source - exact exemplar of media on paywall
INSERT INTO media_sources (media_id, web_link, release_date, paywall_id, paywall_cost)
VALUES
(1, 'https://www.youtube.com/watch?v=SQwrAqvC0bk', '2022-05-27', 1, NULL),
(2, 'https://www.youtube.com/watch?v=yh6NYuc9gC0', '2020-12-24', 1, NULL),
(3, 'https://www.youtube.com/watch?v=nTctuRId4-4', '2022-08-14', 1, NULL),
(4, 'https://www.youtube.com/watch?v=xdlTjRa_KWo', '2022-07-31', 1, NULL),
(5, 'https://www.youtube.com/watch?v=hD8grH0w06o', '2024-02-08', 1, NULL),
(6, 'https://www.youtube.com/watch?v=6X_dXiyNnz8', '2018-01-17', 1, NULL);

-- Views - how many views it has
INSERT INTO views (media_source_id, scan_date, views_count)
VALUES
(1, '2024-12-13', 303822),
(2, '2024-12-13', 2053254),
(3, '2024-12-13', 12164891),
(4, '2024-12-13', 142971),
(5, '2024-12-13', 4444129),
(6, '2024-12-13', 5831430);