-- =============================================================================
-- Test data for Neon DB (run this AFTER neon-init.sql in Neon SQL Editor)
--
-- The admin user is NOT seeded here. Provision it out-of-band with:
--   ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/setup-admin-user.js
-- Never commit real credentials to this file.
-- =============================================================================

-- 2. Forum category
INSERT INTO "public"."forum_categories" ("id", "name", "description", "slug", "color")
VALUES ('clxxforumcat000000001', 'General', 'General drone discussions', 'general', '#3B82F6')
ON CONFLICT DO NOTHING;

-- 3. Event category
INSERT INTO "public"."event_categories" ("id", "name", "description", "slug", "icon", "color")
VALUES ('clxxeventcat000000001', 'Workshop', 'Hands-on workshops', 'workshop', '🎯', '#3B82F6')
ON CONFLICT DO NOTHING;

-- 4. Project category
INSERT INTO "public"."project_categories" ("id", "name", "description", "slug", "icon", "color")
VALUES ('clxxprojcat000000001', 'Research', 'Research projects', 'research', '🚁', '#3B82F6')
ON CONFLICT DO NOTHING;

-- 5. Resource category
INSERT INTO "public"."resource_categories" ("id", "name", "description")
VALUES ('clxxrescat000000001', 'Guides', 'Guides and documentation')
ON CONFLICT DO NOTHING;

-- 6. Service category
INSERT INTO "public"."service_categories" ("id", "name", "description")
VALUES ('clxxsvccat000000001', 'Aerial Photography', 'Aerial photography services')
ON CONFLICT DO NOTHING;

-- 7. Opportunity category
INSERT INTO "public"."opportunity_categories" ("id", "name", "description", "icon", "color", "isActive")
VALUES ('clxxoppcat000000001', 'Jobs', 'Job opportunities', '💼', '#3B82F6', true)
ON CONFLICT DO NOTHING;

-- 8. Employment type
INSERT INTO "public"."employment_types" ("id", "name", "description", "category", "icon", "color", "isActive", "order")
VALUES ('clxxemptype000000001', 'Full-time', 'Full-time employment', 'job', '💼', '#3B82F6', true, 0)
ON CONFLICT DO NOTHING;
