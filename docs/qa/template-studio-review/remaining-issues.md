# Remaining checks and limits

1. **Event 61 owner verification:** the saved local session returned HTTP 401. Its actual invitation response, current stored customizations, owner save/refresh and publication were not verified or changed. The general identity bug was reproduced using the real public catalog IDs in controlled fixtures and fixed without an event-ID exception.
2. **Provider authentication:** Google sign-in rejects the localhost origin on login and registration. The audit retains 16 console messages. An authorized provider configuration and a legitimate account are required to certify live social login; no client registration was changed.
3. **Database/provider gates:** 31 backend tests and 2 opt-in browser checks remain skipped. Full MySQL certification, storage upload/CORS, real payment/Telegram delivery and live-owner HTTP workflows must be run in their explicitly disposable environments. They are not counted as passing here.
4. **Device gates:** Chromium viewport tests and the framed phone simulation do not establish physical iPhone/Safari behavior, camera scanning, OS file sharing or native share sheets. These need real devices.
5. **Existing customization:** previously saved appearance fields are preserved. The fix does not silently reset user artwork or migrate fields that might have been saved while the wrong preview was displayed. Owners should review their assigned design's appearance; unsupported collections remain retained when switching.
6. **Scope retained from earlier implementation:** fixed-order templates keep their ordering, unsupported controls remain unavailable, and PDF ticket export is still deferred. The application continues to use the existing server APIs, media pipeline, subscription/ownership rules and QR identity.

Local code, rendered fixture evidence and archive verification are suitable for independent review. This report does not certify a production release or an authenticated review of the actual event-61 record.
