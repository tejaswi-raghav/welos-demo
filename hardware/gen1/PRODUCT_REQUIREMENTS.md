# welOS Core Gen 1 requirements

Status: design/specification only, 27 November 2026. No physical prototype has been assembled, energized or tested. Independent engineering review is required before procurement release and assembly.


## Two distinct systems

The commercial concept is battery-free PV using an approved grid-tied inverter, independent electrical protection, utility-approved metering, energy monitoring and maintenance diagnostics. The controller never overrides anti-islanding. A grid outage supplies no building backup and removes controller power unless a separately specified approved supply exists. No storage purchase, capacity, reserve, charge/discharge or backup claim belongs to Core Gen 1.

The AED 10,000 demonstrator is a supervised, ground-level, low-voltage measurement rig. It has a nominal 100 W test PV module connected to a guarded DC electronic load. It has NO grid-tied inverter, NO mains export, NO battery, NO roof installation and NO electrical link to a building's PV strings. Separately labeled certified SELV adapters power electronics and the water demonstration. Thus the pump is not represented as powered by test-module generation.

## Acceptance requirements

| ID | Requirement | Verification / gate |
| --- | --- | --- |
| G01 | Budget <= AED 10,000 including 20% contingency | Approved procurement ledger with freight/tax and quotes |
| G02 | No battery or hidden storage dependency | BOM/design review, physical inspection |
| G03 | Cold-corrected PV open-circuit voltage <=30 V, current within protected path ratings | Manufacturer datasheet and engineer calculation before purchase |
| G04 | Solar voltage/current/power and temperature logs | Reference comparison over >=3 operating points |
| G05 | Irradiance reference with documented limitations | SEN0640 compared to calibrated borrowed instrument; no ISO-class claim |
| G06 | Level availability and flow measurements | Tank fill calibration and weighed flow comparison |
| G07 | Pump/valve default off and independent inhibit | E-stop, leak, low water, watchdog and loss-of-power tests |
| G08 | Hardware/synthetic channels separated | Adapter and UI tests; source labels remain visible |
| G09 | Import timestamps/device IDs/faults and stale detection | Contract tests and signed physical test log |
| G10 | No damage/savings claims without field evidence | Pilot report and EPC review before commercial claims |

Water rinse is optional for the commercial product and an experimental lab function only. Wind is excluded: no hub-height measurements, mounting/acoustic approval or useful-energy evidence justifies compromising measurement quality or safety. The existing battery/wind digital demos remain intact.
