
DROP TABLE last_scan_data;
WITH max_scan_date AS (
    SELECT max(scan_date) AS max
    FROM views
)
SELECT 
    views1.media_source_id, 
    views1.scan_date, 
    views1.views_count,
    views1.views_count - PreviousScan.views_count AS delta,
    PreviousScan.scan_date AS previous_scan_date,
    PreviousScan.views_count AS previous_scan_views_count
INTO last_scan_data
FROM (SELECT 
    media_source_id, 
    scan_date, 
    views_count,
    ROW_NUMBER() OVER (PARTITION BY media_source_id ORDER BY scan_date DESC) AS row_num
    FROM views
    ) views1
JOIN (
    SELECT 
    media_source_id,
    scan_date,
    views_count,
    ROW_NUMBER() OVER (PARTITION BY media_source_id ORDER BY scan_date DESC) AS row_num1
    FROM views
    WHERE views.scan_date <= (SELECT max((scan_date) - INTERVAL '1 day') FROM views)
) PreviousScan
ON PreviousScan.media_source_id = views1.media_source_id
WHERE views1.row_num = 1 AND PreviousScan.row_num1 = 1;
SELECT * FROM last_scan_data;