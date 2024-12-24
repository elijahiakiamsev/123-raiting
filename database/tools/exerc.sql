
SELECT media_id, views_count, title, web_link, person_name, delta
              FROM media_sources 
              JOIN last_scan_data l
              ON l.media_source_id = media_sources.id
              AND l.delta > 0
              JOIN media
              ON media_sources.media_id = media.id
              JOIN
                  (
                  SELECT media_id as m_id, person_id
                  FROM collaborators
                  WHERE collaborators.role_id = 1
                  ) AS comedians
              ON comedians.m_id = media_id
              JOIN persons
              ON persons.id = person_id
              ORDER BY delta DESC
              LIMIT 20;