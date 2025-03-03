SELECT ms.id,
ms.media_id,
ms.web_link,
ms.paywall_id,
ms.release_date,
p.title as paywall_title,
m.title,
m.uri,
ps.person_name,
ps.uri as person_uri
FROM media_sources ms
JOIN paywalls p
ON ms.paywall_id = p.id
JOIN media m
ON ms.media_id = m.id
JOIN collaborators c
ON ms.media_id = c.media_id
AND c.role_id = 1
JOIN persons ps
ON c.person_id = ps.id;