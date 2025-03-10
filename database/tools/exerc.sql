ALTER TABLE persons ADD first_name varchar(255);
ALTER TABLE persons ADD last_name varchar(255);
UPDATE persons
SET first_name = regexp_replace(person_name,'(.+)\s\S+$','\1'),
last_name = regexp_replace(person_name,'.+[\s]','');