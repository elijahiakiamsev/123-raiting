-- ALTER TABLE persons ADD first_name varchar(255);
-- ALTER TABLE persons ADD last_name varchar(255);
-- UPDATE persons
-- SET first_name = regexp_replace(person_name,'(.+)\s\S+$','\1'),
-- last_name = regexp_replace(person_name,'.+[\s]','');
SELECT p.id,
        p.uri,
        p.first_name,
        p.last_name,
        LEFT (p.last_name, 1) as name_letter
        FROM persons p
        ORDER BY p.last_name, p.first_name;