## Summary of Changes

<!-- Briefly describe what this PR introduces and the problem it solves. -->

## Architectural Compliance Checklist

- [ ] Does NOT bypass domain boundaries (no direct cross-domain DB access).
- [ ] Does NOT import AWS SDKs directly into domain logic.
- [ ] Preserves backend authority for authorization (no trusting client claims).
- [ ] Enforces tenant isolation (scoped by organization/branch).
- [ ] Emits domain events or uses application interfaces for cross-domain workflows.
- [ ] If changing architectural boundaries or major tech choices, includes an ADR under `.agent/ADR/`.

## Affected Domains / Packages

- [ ] apps/api (Domain: __________)
- [ ] apps/realtime
- [ ] apps/worker
- [ ] apps/ai
- [ ] packages/__________
- [ ] frontend/__________
- [ ] infra/__________

## Testing & Verification

<!-- Explain how these changes were tested (unit, integration, manual). -->
