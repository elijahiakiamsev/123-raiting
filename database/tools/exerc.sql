SELECT m.id, m.title, m.uri, p.person_name
    FROM media m
    JOIN collaborators c
    ON m.id = c.media_id
    AND c.role_id = 1
    JOIN persons p
    ON c.person_id = p.id
    ORDER BY id DESC;