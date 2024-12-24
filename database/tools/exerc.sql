
SELECT 
    v.media_source_id, 
    ms.release_date,
    v.scan_date, 
    v.views_count,
    CASE
        WHEN ms.release_date
        BETWEEN (v.scan_date - INTERVAL '1 day')
        AND v.scan_date
        THEN v.views_count
        ELSE v.views_count - ps.views_count
    END 
    AS delta,
    ps.scan_date AS previous_scan_date,
    ps.views_count AS previous_scan_views_count
INTO last_scan_data
FROM (SELECT 
    media_source_id, 
    scan_date, 
    views_count,
    ROW_NUMBER() OVER (PARTITION BY media_source_id ORDER BY scan_date DESC) AS row_num
    FROM views
    ) v
JOIN (
    SELECT
    id,
    release_date,
    1 AS row_to_keep
    FROM media_sources
) ms
ON v.row_num = ms.row_to_keep AND v.media_source_id = ms.id
LEFT JOIN (
    SELECT 
    media_source_id,
    scan_date,
    views_count,
    ROW_NUMBER() OVER (PARTITION BY media_source_id ORDER BY scan_date DESC) AS row_num1
    FROM views
    WHERE views.scan_date <= (SELECT max((scan_date) - INTERVAL '1 day') FROM views)
) ps
ON ps.media_source_id = v.media_source_id
AND ps.row_num1 = 1;