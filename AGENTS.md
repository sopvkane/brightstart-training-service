# Repository guidance

- Keep code explicit and readable for first-year apprentices. Add abstractions only when a real
  responsibility requires them.
- Use `docs/how-the-service-works.md` when changing request flows and `docs/testing.md` when
  changing test strategy.
- Run `npm run format:check` and `npm run check:frontend` for frontend changes. Run
  `cd api && ./mvnw verify` for API changes. Run `npm run test:browser` when changing a complete
  service journey.
- Keep frontend dependencies in `frontend/package.json`; keep Java dependencies in `api/pom.xml`.
- Preserve the non-GOV.UK branding. Do not use the Crown, GOV.UK logotype, GDS Transport or GOV.UK
  favicon assets.
- Do not add real Deloitte or client data, code, endpoints or documentation.
- Do not introduce deferred product features or infrastructure unless the task explicitly requires
  them.
- Preserve request-ID propagation and keep logs free of bodies, cookies, secrets, tokens and file
  content.
- Read feature flags through the central frontend configuration and keep default behaviour healthy.
- Keep learner scenarios separate from facilitator guidance; neither area is secret when committed.
