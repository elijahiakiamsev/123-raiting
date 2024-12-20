SELECT media.id, media.title, media.uri as uri, media_sources.id as source_id,
web_link, collaborators.person_id as person_id,
collaborators.role_id as role_id, person_name, roles.title as role_title
FROM media
LEFT JOIN media_sources
ON media.id = media_sources.media_id
LEFT JOIN collaborators
ON media.id = collaborators.media_id
LEFT JOIN persons
ON collaborators.person_id = persons.id
LEFT JOIN roles
ON collaborators.role_id = roles.id
ORDER BY media.id;