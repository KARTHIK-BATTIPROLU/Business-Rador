# Project: Google Maps Scraper Technical Breakdown & Business Radar Integration

## Architecture
- **Target Repository**: `https://github.com/omkarcloud/google-maps-scraper`
  - Engine: Hybrid Browser (CDP) + Streaming HTTP GET requests (`window.APP_INITIALIZATION_STATE`)
  - Enrichment: Contact & social web crawler (`website-email-contact-scraper`), reviews RPC (`/async/reviewSort`)
  - Anti-Blocking: CDP stealth, port randomization (50000–55000), Turnstile bypass, proxy rotation, Token Bucket Rate Limiter (2.0 req/s), Gaussian Jitter, 4-state Circuit Breaker
  - Server & API: Botasaurus Desktop & Server with 13 REST API endpoints and SQLite task store
- **Existing Application**: `Business-Founder-Researcher-main`
  - Stack: Next.js 14 App Router, TypeScript, MapLibre GL JS, Supabase (PostGIS & Realtime)
  - Discovery Pipeline: Python agents (`osm_agent.py`, `google_maps_agent.py`, `instagram_agent.py`, `grok_enrichment_agent.py`)
  - Integration Target: Replace official Google Places API calls with containerized Botasaurus microservice, extend Supabase schema via Migration 003, replace synthetic UI media with authentic scraped photos/reviews, and deploy Split-Tier Proxy Routing.

## Feature Inventory
| # | Feature / Capability | Description | Milestone | Source |
|---|----------------------|-------------|-----------|--------|
| 1 | Hybrid Streaming Extraction Engine | Browser-based search feed scrolling + parallel HTTP GET parsing of `APP_INITIALIZATION_STATE` | M1 | Survey (spec_miner) |
| 2 | Full Business Identity & Attributes Schema | 50+ fields: name, `kgmid` (primary key), place_id, cid, categories, address parts, coordinates, timezone, description | M1 | Survey (spec_miner) |
| 3 | Contact & Multi-Platform Social Enrichment | Extraction of direct emails (Cloudflare XOR decoding), phone numbers, and 17 social profiles | M1 | Survey (spec_miner) |
| 4 | Unclaimed Business Detection (`can_claim`) | Identification of unclaimed Google Business Profiles for high-priority agency lead scoring | M1 | Survey (spec_miner, explorer_3) |
| 5 | Reviews & RPC Pagination Extraction | Deep review extraction via `/async/reviewSort` (ratings, text, author, owner replies, ISO dates) | M1 | Survey (spec_miner) |
| 6 | Authentic Media & Storefront Imagery | Real Google photo URLs and image counts to replace synthetic Unsplash placeholders | M1 | Survey (spec_miner, explorer_2) |
| 7 | Anti-Blocking & Stealth Evasion | CDP driver, port randomization, Token Bucket Limiter, 4-state Circuit Breaker, Gaussian jitter | M1 | Survey & Rem 1 |
| 8 | Query Handling & Geographic Modalities | Natural language queries, bounding box tiles (Zoom 15–18), GeoJSON polygons, country/city sweeps | M1 | Survey (spec_miner) |
| 9 | Execution Model & Concurrency | Multi-threaded async workers (bounded 3..5), Botasaurus server task management, SQLite caching | M1 | Survey & Rem 1 |
| 10 | Output Formats & REST API Suite | CSV, JSON, Excel exports, 13 REST API endpoints for async/sync task execution | M1 | Survey (spec_miner) |
| 11 | Existing Codebase Architecture Analysis | Next.js 14, Supabase, MapLibre, Python agent orchestrator, GitHub Actions cron | M1 | Survey (explorer_2) |
| 12 | Synthetic Data & Founder Gap Identification | Analysis of Unsplash mock data (`lib/media-helpers.ts`) and total absence of founder research | M1 | Survey (explorer_2) |
| 13 | Capability-to-Component Mapping Matrix | Direct mapping of scraper features to UI components, Python agents, and Supabase tables | M1 | Survey (explorer_3) |
| 14 | Database Schema Reconciliation & Migration | SQL migration script (`003_integrate_gmaps_scraper.sql`) with `upsert_scraped_business` and `dedup_identity_hash` | M1 | Rem 2 |
| 15 | TypeScript Interface Extensions | Backward-compatible schema extensions in `lib/types.ts` and SDK in `lib/scraper-client.ts` | M1 | Rem 3 |
| 16 | Architectural Pathways & Comparative Evaluation | Detailed trade-off analysis of Pathway A (Embedded), Pathway B (Microservice), Pathway C (Queue) | M1 | Survey (explorer_3) |
| 17 | Production Deployment & Operational Blueprint | Sizing (`t3.medium`), Docker (`shm_size: 2gb`, `init: true`), Caddy TLS 1.3, Split-Tier Proxy ($45/mo) | M1 | Rem 1 & Rem 3 |
| 18 | Phased Implementation Roadmap & API Specs | 3-phase rollout roadmap, Python client (`GoogleMapsScraperClient`), Next.js REST endpoints & Webhook | M1 | Rem 3 |
| 19 | Deliverable Report Generation | Compile comprehensive, authoritative markdown report in working directory (2,626 lines, 156.8 KB) | M1 | Worker M1.2 |
| 20 | Multi-Angle Independent Review | 4 Reviewers, 4 Challengers, and 2 Forensic Auditors across 2 iterations (PASS) | M2 | Gate Iteration 2 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Author Deliverable Report | Worker compiles exhaustive technical markdown report in working directory | Survey Phase | DONE |
| M2 | Review, Challenge & Forensic Audit | Reviewers, Challengers, and Forensic Auditor verify completeness & integrity | M1 | DONE |

## Key Milestone Outputs
- **Deliverable Path**: `c:\Users\Karthik\OneDrive\Desktop\Business Rador\Business-Founder-Researcher-main\GOOGLE_MAPS_SCRAPER_ANALYSIS_AND_INTEGRATION_REPORT.md` (2,626 lines, 156.8 KB)
- **Gate Status**: Iteration 1: FAIL (Challenger 2 requested changes) -> Iteration 2: PASS (Reviewer 3: APPROVE, Reviewer 4: APPROVE, Challenger 3: APPROVE, Challenger 4: APPROVE, Auditor 2: CLEAN).

## Interface Contracts
### Deliverable Report Contract
- **File**: `c:\Users\Karthik\OneDrive\Desktop\Business Rador\Business-Founder-Researcher-main\GOOGLE_MAPS_SCRAPER_ANALYSIS_AND_INTEGRATION_REPORT.md`
- **Format**: Markdown with structured headings, code blocks, comparative tables, SQL migrations, and TypeScript interfaces.
- **Coverage**: Strictly fulfills R1, R2, R3 and all Acceptance Criteria.

## Code Layout
- Agent metadata: `.agents/teamwork/`
- Application working directory: `Business-Founder-Researcher-main/`
- Deliverable report: `Business-Founder-Researcher-main/GOOGLE_MAPS_SCRAPER_ANALYSIS_AND_INTEGRATION_REPORT.md`
