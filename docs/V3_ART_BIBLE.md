# Chánh Điện Online 3.0 — Art Bible & Stage Spec (v0.1)

**Status:** implementation specification; master concept **awaits user visual approval**. This is not a claim that the live renderer matches the earlier photorealistic concept.

## 1. Creative direction
A calm Vietnamese Buddhist ceremonial hall, richly carved dark red wood, bronze/gold altar, luminous but restrained candles, fine incense smoke, delicate pink lotus petals and believable perspective. The space should be **reverent, not a casino**. Artificial gifts are visibly labelled; donation value never implies spiritual merit.

### Master palette
| Token | RGB hex | Use |
|---|---|---|
| Deep lacquer | `#1B0D0A` | Deep wood shadows, plaque, framing |
| Warm walnut | `#58301D` | Floor, carved wood, cushion |
| Bronze | `#986128` | Metallic bevels and lantern |
| Temple gold | `#E4B65E` | Highlights, title, low-level aura |
| Light gold | `#FFE6A0` | Peak luminance, VIP text |
| Lotus rose | `#F2A4BD` | Rose petals / flower accent |
| Porcelain | `#F8EBD4` | Text, robe highlights |
| Neutral fabric | `#B6A9A0` | Non-VIP devotee outfits |

Avoid saturated neon, fast strobing, flickering text, and text superimposed over the Buddha's face.

## 2. Technical artboard
- Primary canvas: **1080 × 1920, portrait 9:16**, 30 FPS reference target.
- Render assets independently from the UI; let CSS display crop-safe overlay within the stage.
- Avoid important labels at the 100 px outer edges and in TikTok's comment/action areas. Actual UI-safe region **must be verified with target TikTok LIVE Studio capture**; these guides are not platform-certified.
- Reference scene: altar upper half; visible entrance along central aisle at bottom; at least 3 seats on each side of the aisle for 36-seat default.
- Layer order: base temple -> geometry-clean wood floor -> dynamic seat cushions -> occupants (sort by y depth when implemented) -> shadows/light/aura -> drifting petals -> foreground jambs / light -> fixed HUD and legible nickname labels.
- Naturalistic values: subdued highlights during chanting, stronger events only for a few seconds and with Reduced Motion alternative.

## 3. Geometry contract
**All cushions are dynamic and individually addressable**; none should be baked into the final production background.
- Seat mode 24 = 6 columns x 4 rows.
- Seat mode 36 = 6 columns x 6 rows.
- Seat mode 64 = 8 columns x 8 rows.
- Seat mode 100 = 10 columns x 10 rows.
- Every row preserves an unobstructed central aisle and an unambiguous seat center.
- Draw Y depth controls cushion scale; center name above each person's head in a bounded-width plaque.
- Entrance path: center doorway at (540, 2020) -> central aisle up to assigned row -> move laterally -> kneel/sit. On leaving: reverse route toward doorway.
- Never evict a real visitor in favor of a simulated visitor. Avatar/gift mock data must remain labelled on-air.

## 4. Required painterly production layers
| ID | Layer | Alpha | Final format |
|---|---|---|---|
| ART01 | Temple architecture and altar, **without fixed cushions** | opaque | optimized WebP / PNG |
| ART02 | Carved door jamb and decorative foreground | alpha | PNG/WebP |
| ART03 | Clean reflective wooden floor | alpha | PNG/WebP + normal/light maps as needed |
| ART04 | Meditation cushions with baked AO/shadow | alpha | PNG/WebP |
| ART05 | Incense, lotus petals, soft light shafts | alpha | animation sprites / shader |
| ART06 | Devotee costume + rig, each skin and pose | alpha | atlas + metadata |
| ART07 | VIP jewelry/prop/light packages | alpha | atlas + particle FX |
| ART08 | Vườn Sen and Sân Hoa Đăng scene swaps | mixed | layered scenes |

The current branch adds `assets/scenes/*.svg` as **functional, resolution-independent placeholders** for ART02–ART04, not final cinematic painted assets. They make dynamic seats possible without baked seats, and will be replaced by approved painted layers.

## 5. Character animation contract
A canonical actor must be reviewed before production of the remaining six:
- enter/walk, turn left/right, kneel, sit, chant, bow, offer lotus, hold lantern, stand, leave.
- feet/hips remain in same coordinate system as cushion center; body and outfit never detach or scale differently.
- keep stable unique TikTok IDs separate from display nicknames.
- 1–2 variants of idle breathing are sufficient, but transitions must not snap.

## 6. Gift ceremony contract
- Gift-to-animation mapping and tier logic are separate from art renderer.
- Each cinematic has start/action/end and yields back to the existing chant.
- Cosmetic changes: halo, robe accent, lotus lantern, pedestal and short thank-you banner, with preset lifetime.
- Explicit mock treatment: `MẪU` label on nicknames and `QUÀ ẢO` on demo gift banners, excluded from real donor ranking and gifts.
- Do not imply supernatural benefit from a payment.

## 7. Visual QA gate
Capture **real browser/OBS screenshots**, not only generative concept posters:
1. Empty 36-seat hall: no duplicate baked cushions; aisle clearly visible.
2. 1 person entering from bottom center, traversing aisle, kneeling at a specific seat.
3. 24/36/64/100 mode: exact number of seats, no intersecting aisle or HUD, no missing character.
4. VIP gift: name, costume, prop, aura remain aligned in movement.
5. Repeated gifts: bounded queue, correct 1 → 21 effect mapping, no runaway memory.
6. Mobile-equivalent aspect: 540 × 960 preview and 1080 × 1920 reference.
7. Baseline target: >=30 FPS with 100 participants on a defined streaming PC and OBS capture; threshold remains **unverified** until hardware run.

## 8. Acceptance / decision
Master concept requires **visual sign-off**. Each progress item in `LIVE_V3_CHECKLIST.md` stays unchecked until its named gate has passed. Code-complete is not the same as visual-production-ready.