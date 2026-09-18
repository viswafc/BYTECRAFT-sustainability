# shared/

Cross-language contracts. Today the API types are hand-mirrored in
`frontend/src/types/api.ts` from `backend/app/schemas/`. When the contract grows (Phase 3+),
generate `openapi.json` here (`curl :8000/openapi.json > shared/openapi.json`) and derive the
TypeScript types from it instead of maintaining them by hand.
