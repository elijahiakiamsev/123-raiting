SELECT r.media_raiting, m.uri, m.title, ms.web_link, extract(year from ms.release_date) AS year, p1.person_name
        FROM raiting r
        JOIN persons p
        ON r.person_id = p.id AND p.uri = 'Ilia_Iakiamsev'
        JOIN media m
        ON m.id = r.media_id
        JOIN media_sources ms
        ON ms.id = m.id
        JOIN collaborators c
        ON m.id = c.media_id AND c.role_id = 1
        JOIN persons p1
        ON c.person_id = p1.id
        ORDER BY r.media_raiting DESC, m.title ASC;