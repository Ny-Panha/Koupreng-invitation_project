-- V44 snapshots freeze typed benefits. Retain the existing JSON benefit keys too.
-- Do not replace snapshots already captured by the application at order creation.
UPDATE subscriptions s JOIN packages p ON s.package_id = p.package_id
SET s.benefits_snapshot = JSON_SET(s.benefits_snapshot, '$.featuresJson', CAST(p.features_json AS CHAR))
WHERE s.benefits_snapshot IS NOT NULL
  AND JSON_CONTAINS_PATH(s.benefits_snapshot, 'one', '$.featuresJson') = 0;
