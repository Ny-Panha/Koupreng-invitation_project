# Save the Date

The reusable section occupies the existing `countdown` slot. It supports a custom heading/subtitle, canonical event date/time/timezone, optional venue summary, four-part countdown, event-month calendar and `.ics` action. Individual toggles preserve stored data. Number settings follow content language or explicitly select Khmer/Latin digits. Circular, minimal and template styles are available.

Traditional skins inherit their established gold/burgundy or botanical green tokens. Artwork, borders, opening interactions and image assets were not replaced. The reference screenshots supplied structure and hierarchy; their decorative artwork was not copied into the project.

`SaveTheDateEditor` is reachable in Guided Design & Content and Advanced Experience. Event Essential's existing neutral editor also exposes date settings without duplicating its canonical date inputs. The guide still has five steps. Silk Heritage's existing ordered-section system supports swapping date/program placement; other dedicated layouts keep their existing positions.

Missing dates display a localized announcement placeholder. Missing event times produce an all-day calendar event without a guessed timed countdown. Authored subtitles/headings are not translated automatically. The Khmer month/weekday vocabulary is explicit because browser ICU builds can otherwise fall back to English for `km-KH`.
