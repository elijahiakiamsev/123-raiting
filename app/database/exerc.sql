SELECT raiting.media_raiting, media.title
FROM raiting
JOIN persons
ON raiting.person_id = persons.id
JOIN media
ON media.id = raiting.media_id
WHERE persons.uri in ('Ilia_Iakiamsev')
ORDER BY raiting.media_raiting DESC;
