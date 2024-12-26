SELECT 
              media_id,
              views_count,
              title,
              extract(year from media_sources.release_date) AS year,
              web_link,
              person_name,
              delta
              FROM media_sources ms
              JOIN last_scan_data
              ON last_scan_data.media_source_id = ms.id
              JOIN media
              ON ms.media_id = media.id
              JOIN
                  (
                  SELECT media_id as m_id, person_id
                  FROM collaborators
                  WHERE collaborators.role_id = 1
                  ) AS comedians
              ON comedians.m_id = media_id
              JOIN persons
              ON persons.id = person_id
              AND extract(year from ms.release_date) = 2024
              ORDER BY views_count DESC
              ;