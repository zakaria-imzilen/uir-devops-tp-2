# API Testing with Postman and Newman

This directory contains the Postman collection and environment(s) used for automated API testing in Jenkins.

- Collection: `DevOps-App.postman_collection.json`
- Environment template: `DevOps-App.postman_env.template.json`
- CI-generated environment: `env.json` (created during the Jenkins run with the VM IP and `{{baseUrl}}`)
- JUnit output: `newman-results.xml`

## Endpoints Covered
- `GET {{baseUrl}}/api/apps` — currently validated to return 200 or 401
- `POST {{baseUrl}}/api/apps/create` — expected 401 when unauthenticated
- `GET {{baseUrl}}/api/apps/:id` — expected 401 when unauthenticated
- `PUT {{baseUrl}}/api/apps/:id/update` — expected 401 when unauthenticated
- `DELETE {{baseUrl}}/api/apps/:id/delete` — expected 401 when unauthenticated
- `GET {{baseUrl}}/api/apps/metrics` — expected 200 and Prometheus content

## Test Data Management Strategy

Because the API is protected by Supabase authentication (RLS), most modifying endpoints require an authenticated user.

Short-term (implemented):
- Focus on non-authenticated verifications (correct 401 responses) and public metrics endpoint health.

Planned enhancements (recommended):
1. Seed test data using a controlled path:
   - Provide a temporary service endpoint (only enabled in non-production via env flag) that inserts deterministic fixtures for a dedicated test user.
   - Alternatively, use SQL migrations (e.g., `app/db/schema.*.sql`) and run a setup step before Newman to seed tables for a known user id.
2. Authenticated test flow options:
   - Service Role Key: call API routes that accept a `SUPABASE_SERVICE_ROLE` token for CI-only authentication. Keep this key in Jenkins credentials and inject as header `apikey` or `Authorization: Bearer <key>`.
   - Magic Link: trigger Supabase auth magic-link for a test user and capture session cookies in a pre-request script. This is more complex and slower.
3. Teardown:
   - Provide a teardown endpoint or SQL cleanup step to remove the seeded fixtures at the end of tests.

Recommended minimal CI approach:
- Use a service-role-protected testing route (or a header flag checked server-side) to insert and delete fixtures. Wire credentials via Jenkins credentials and Postman environment variables.

## Running Locally

Using Docker (no local Node dependencies required):

```bash
mkdir -p tests/postman
# optional: adjust baseUrl inside env.json
cat > tests/postman/env.json <<'JSON'
{
  "id": "local-env",
  "name": "Local",
  "values": [
    { "key": "baseUrl", "value": "http://localhost:3000", "type": "text", "enabled": true }
  ],
  "_postman_variable_scope": "environment"
}
JSON

docker run --rm -v "$PWD/tests/postman:/etc/newman" postman/newman:alpine \
  run /etc/newman/DevOps-App.postman_collection.json \
  -e /etc/newman/env.json \
  -r cli,junit --reporter-junit-export /etc/newman/newman-results.xml
```

The Jenkins pipeline generates JUnit results and publishes them under the "API Tests (Postman/Newman)" stage.
