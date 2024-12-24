SELECT
    p.person_name,
    SUM(l.delta) as big_delta
FROM persons p
LEFT JOIN collaborators c
ON p.id = c.person_id
AND c.role_id = 1
JOIN media m
ON c.media_id = m.id
JOIN media_sources ms
ON m.id = ms.media_id
JOIN last_scan_data l
ON ms.id = l.media_source_id
GROUP BY person_name
ORDER BY big_delta DESC
;