SELECT p.id,
        p.uri,
        p.first_name,
        p.last_name,
        LEFT (p.last_name, 1) as name_letter
        FROM persons p
        ORDER BY p.last_name, p.first_name;
