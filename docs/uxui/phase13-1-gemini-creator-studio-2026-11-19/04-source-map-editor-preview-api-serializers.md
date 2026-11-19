# 04 — Source Map: Editor, Preview, API, and Serializers

## 1. Component Architecture
- **Route Controller:** `InvitationEditFeature.jsx`
- **Main Form:** `InvitationForm.jsx`
- **Command Toolbar:** `StudioToolbar.jsx`
- **Section Rail:** `StudioSections.jsx`
- **Split Controls:** `StudioSplitControls.jsx` and `useStudioSplit.js`
- **Persistence Controller:** `useStudioPersistence.js`
- **Live Preview Simulator:** `LivePhoneSimulator.jsx`
- **Preview Channel Bridge:** `previewMessaging.js`
- **Data Adapters:** `invitationDraftAdapter.js` and `draftToTemplate.js`

## 2. Data Flow
1. Load: `invitationService.get(id)` -> `publicInvitationToDraft` -> `InvitationForm` state.
2. Edit: Local state updates optimistic form fields.
3. Preview: `postPreviewMessage(LIVE_PREVIEW_SYNC)` over same-origin iframe channel with session nonce.
4. Persist: `useStudioPersistence` flushes `draftToInvitationPayload` to `invitationService.update(id, payload)` and local `weddingStorage`.

See [Source Reconciliation](evidence/studio-source-inventory-reconciliation.json).
