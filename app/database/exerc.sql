INSERT INTO views (media_source_id, scan_date, views_count)
SELECT counters.media_id, CURRENT_TIMESTAMP, counters.views
FROM json_to_recordset('[{"media_id":1,"views":10000}]')
AS counters (media_id INTEGER, views INTEGER);