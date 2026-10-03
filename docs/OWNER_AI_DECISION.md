# Owner AI decision — ARCH-001

Status: **OWNER_DECISION_REQUIRED**. The current backend abstraction and truthful fallback remain. No paid provider, model, key or real external AI call was enabled.

| Dimension | Current implementation | Required owner decision / later work |
| --- | --- | --- |
| Provider | `AiInvitationProvider` bean interface; no concrete external adapter | Select provider and approve credentials/data handling; implement adapter |
| Provider name | `AI_ASSISTANT_PROVIDER`, currently blank | Exact configured adapter identifier |
| Enablement | `AI_ASSISTANT_ENABLED=false` | Enable only after approval and adapter validation |
| Model | No model binding exists | Select model; future backend-only `AI_MODEL` binding would require code |
| Credentials | No AI API-key binding exists; no frontend keys | Provider-specific backend secret store; a future `AI_API_KEY` is a proposal, not a supported current variable |
| Timeout | `AI_ASSISTANT_TIMEOUT_MILLIS=10000`; positive validation; timeout cancellation | Approve budget and adapter transport timeouts |
| Input | DTO character caps: language/tone 60 each, event type 120, couple names 240, host name 120, venue 240, event date 60, notes 5,000 | Approve prompt composition, token cap, privacy and retention; character limits are not a token budget |
| Output | No current token/character output cap | Approve cap; implement adapter enforcement. A future `AI_MAX_OUTPUT_TOKENS` would need binding and tests |
| Usage estimate | No provider usage/cost metering exists | Capture provider input/output token counts in backend adapter response/accounting; attach owner/account/operation/request ID without logging private prompts. Define prices/budget using selected provider documentation before enablement |
| Entitlements | Package `ai_assistant_enabled` flag and central AI feature exist; commercial hook not wired to route | Approve FREE/BASIC/PRO/PREMIUM eligibility and per-account request/token limits, then integrate centrally |
| Failures | Disabled/missing adapter, timeout, interruption, errors or blank output fall back | Preserve typed warnings and usable local suggestions; test provider failure and rate-limit states |

Five operations are supported by the abstraction: invitation copy, story, formal text, translation and timeline suggestions. Only nonblank adapter output is reported as `AI_PROVIDER`; fallback uses `LOCAL_TEMPLATE`, `enabled=false`, empty `generatedText`, local suggestions and warnings. Local template output must never be presented as provider output. Provider success in a mocked adapter is not real-provider validation.

Owner approval must specify provider/model, allowed invitation/customer data, credentials and retention, maximum input/output, usage/cost ceiling, entitlements and fallback experience. Do not infer paid-provider configuration from the three existing assistant flags. Keep keys on the backend. After approval, implement and test the adapter against controlled responses before an explicitly authorized provider sandbox/live call. No estimated prices or invented production usage are recorded here.
