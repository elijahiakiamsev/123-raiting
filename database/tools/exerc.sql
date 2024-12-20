SELECT m.id, m.title, m.uri as uri, media_sources.id as source_id,
web_link, collaborators.person_id as person_id,
collaborators.role_id as role_id, person_name
FROM ( SELECT * FROM media WHERE media.id = 4) as m
LEFT JOIN media_sources
ON m.id = media_sources.media_id
LEFT JOIN collaborators
ON m.id = collaborators.media_id
LEFT JOIN persons
ON collaborators.person_id = persons.id
LEFT JOIN roles
ON collaborators.role_id = roles.id
WHERE role_id = 1;