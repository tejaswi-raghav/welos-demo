# Electrical safety and energization holds

Status: design/specification only, 27 November 2026. No physical prototype has been assembled, energized or tested. Independent engineering review is required before procurement release and assembly.


This file is a design-review checklist, not instructions for mains wiring. Only qualified personnel may design/assemble the protected power circuit. No mains terminals, DIY grid inverter or roof electrical works are part of this budget.

1. Select certified sealed SELV adapters with the correct output rating and accepted local approvals. No improvised mains PSU. Keep the wall supply and connectors dry and outside splash/overflow paths.
2. Have an engineer verify module datasheet, cold Voc <=30 V, maximum source current, electronic-load DC safe operating area, cable ratings and interruption ratings. A module remains energized in light. Use proper PV-rated isolation and covered terminals.
3. Choose fault-current protection based on both the PV source and any auxiliary backfeed path. Separate electronic control and actuator branches. Select E-stop/relay contacts for DC interruption and the pump's stall/inrush current. Do not guess fuse sizes from the 100 W nameplate alone.
4. A normally de-energized actuator-enable chain includes independent E-stop, low-water and leak inhibition. Validate fail-open wiring behavior, contact welding/stuck MOSFET, sensor disconnection, watchdog and power interruption. The application policy is advisory and cannot satisfy independent protection by itself.
5. Protect every ESP32 input from 5/12 V sensor outputs. SEN0217 output can exceed 4.7 V with a 5 V supply. Use an engineer-reviewed level shifter/interface. Isolate long RS485 links and evaluate transient/ground-loop protection.
6. Guard hot electronic load components, add overtemperature shutdown and restrain wiring against pullout. Document accessible surface-temperature limits and actual measured results before public demonstrations.
7. Water enclosure ingress claims require certified enclosure/glands and installed assembly evaluation. Buying an IP-rated box does not certify the completed rig. Provide drip loops, a catch tray and physical separation above highest possible water level.

## Release records

Procurement release: engineer-approved schematic, ratings, datasheets, risk assessment and final BOM. Energization release: signed inspection, continuity/protection checks appropriate to the design, dry-run with current-limited source, independent stop-chain test and documented test supervision. Public demonstration release: completed physical acceptance tests and written owner/operator briefing.

For commercial mains/grid work, obtain local utility, electrical, structural, fire/building and product conformity reviews separately. The lab's successful low-voltage tests cannot establish grid compliance.
