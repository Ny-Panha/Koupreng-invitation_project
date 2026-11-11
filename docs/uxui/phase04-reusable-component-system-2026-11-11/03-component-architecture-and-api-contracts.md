# 03 — component architecture and API contracts

The system keeps native controls and existing cross-app boundaries. User and admin components share canonical `--ui-theme-*` role values through the Phase 03 mirror, while invitation renderer CSS retains its authored palettes. No new component runtime or global reset was introduced.

| Primitive | Stable API | Phase 04 addition | State/semantics |
|---|---|---|---|
| `LoadingButton` | `children,isLoading,disabled,type,className,onClick,...props` | `aria-busy` when loading | Native disabled blocks repeat click; explicit `type=button` default |
| `ResponsiveTable` | `children,className,containerClassName,ariaLabel` | Named focusable scroll region and visible focus/forced-color outline | Table keeps its accessible name; keyboard can reach horizontal viewport |
| `FormField` | `label,htmlFor,required,error,helperText,children,className` | Management role colors, Khmer line height, forced-color focus/error | Native label and description wiring unchanged |
| `SearchInput` | `value,onChange,onClear,placeholder,ariaLabel,clearLabel,disabled` | Management role colors, 44px clear target, focus/forced-color outlines | Search and clear accessible names unchanged |
| User `StatusBadge` | `status,label,variant,className` | Management-only semantic status colors | Invitation renderer badge artwork keeps former styling; pending remains warning |
| Admin `ActionButton` | `variant,size,className,...props` | Safe default `type=button`; danger role tokens | Caller `type=submit` still wins through prop spread |
| Admin `StatusBadge` | `status,tone` | Semantic success/danger/warning/gold/neutral role colors | Status text and `PAID_PENDING_REVIEW` classification unchanged |
| Admin `StatCard` | Label/value/tone/trend/progress etc. | Surface/ink/border roles | Server-provided value remains unmodified |
| Admin `Toast` | `toast,onClose` | Error persists until dismissal; Khmer/English close name; theme/forced-color surface | Info auto-dismisses at 3.5 seconds; `alert` vs `status` retained |

FormField's native label, required, `aria-invalid`, help/error association and composite group logic remain unchanged. Modal's existing stack/inert, Escape, focus trap, and focus return remain unchanged. Source-level API compatibility and focused tests support this bounded change; a full ref audit across every primitive remains open.
