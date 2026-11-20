import { simulateDay, DEFAULT_SCENARIO, REFERENCE_SITE, type Scenario } from "@/lib/energy/model";

export type Source = "solar" | "wind" | "water";
export type ComponentId = "solar" | "wind" | "water" | "storage" | "distribution" | "monitoring";

export type ComponentInfo = {
  id: ComponentId;
  code: string;
  name: string;
  role: string;
  efficiency: string[];
  sustainability: string;
  source?: Source;
};

export const COMPONENTS: ComponentInfo[] = [
  {
    id: "solar", code: "PV-01", source: "solar",
    name: "Solar array",
    role: "Primary generation. 420 m² of monocrystalline modules on a 25° equator-facing tilt; the canopy also serves as a rain-catchment surface.",
    efficiency: ["Module η 21% at STC", "−0.35%/°C above 25 °C cell temperature", "4% soiling, 14% system losses"],
    sustainability: "Largest share of avoided grid emissions on clear days.",
  },
  {
    id: "wind", code: "WT-02", source: "wind",
    name: "Wind turbines",
    role: "Complementary generation, strongest in the afternoon sea-breeze and after sunset. Two 8 m horizontal-axis rotors.",
    efficiency: ["Cp 0.38 (Betz limit 0.593)", "Cut-in 3 m/s · rated 12 m/s · cut-out 25 m/s", "Only deployed where site wind data supports it"],
    sustainability: "Extends renewable supply into evening hours, reducing battery cycling.",
  },
  {
    id: "water", code: "HY-03", source: "water",
    name: "Water-energy recovery",
    role: "In-pipe runner recovering pressure otherwise wasted in a water supply network, beside a rain-harvest cistern.",
    efficiency: ["Turbine + generator η 60%", "30 m recoverable head (≈ 3 bar)", "Continuous, weather-independent baseload"],
    sustainability: "Turns dissipated hydraulic energy into steady 24-hour output.",
  },
  {
    id: "storage", code: "BS-04",
    name: "Energy storage",
    role: "Lithium-iron-phosphate battery shifting surplus daytime energy into the evening peak and buffering variability.",
    efficiency: ["96% charge / 96% discharge efficiency", "0.5C power limit", "Operating window 10–95% state of charge"],
    sustainability: "Raises self-sufficiency by storing energy that would otherwise be curtailed or exported.",
  },
  {
    id: "distribution", code: "DS-05",
    name: "Distribution",
    role: "Inverters, protection and the point of connection. Balances on-site supply with demand and the grid.",
    efficiency: ["Inverter losses included in PV system losses", "Grid import only when storage is depleted", "Surplus exported or curtailed"],
    sustainability: "Grid emission factor assumed at 0.40 kg CO₂/kWh for avoided-emission estimates.",
  },
  {
    id: "monitoring", code: "IC-06",
    name: "Monitoring & control",
    role: "Edge controller running the WELOS control loop: sense → compare → decide → act — comparing expected and measured output, protecting battery reserves and scheduling panel cleaning.",
    efficiency: ["1 h simulation step in this demonstration", "Expected-vs-measured deviation flags soiling and faults", "Local control continues without connectivity"],
    sustainability: "Condition-based cleaning saves water compared with fixed cleaning schedules.",
  },
];

export function runInstallation(enabled: Record<Source, boolean>, sc: Scenario = DEFAULT_SCENARIO) {
  const site = {
    ...REFERENCE_SITE,
    pvAreaM2: enabled.solar ? REFERENCE_SITE.pvAreaM2 : 0,
    turbines: enabled.wind ? REFERENCE_SITE.turbines : 0,
  };
  return simulateDay({ ...sc, waterFlow: enabled.water ? sc.waterFlow : 0 }, site);
}
