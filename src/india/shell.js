// Chrome behaviour for India pages. They deliberately do not load ui/chrome.js: its AI panel
// reads the UAE build and would explain AED figures next to INR ones.
import "../ui/base.css";
import { webglAvailable } from "../ui/gl.js";

if (!webglAvailable()) document.documentElement.classList.add("no-gl");
const head = document.getElementById("site-head");
const btn = head?.querySelector(".menu-btn");
const close = () => { head?.removeAttribute("data-open"); btn?.setAttribute("aria-expanded", "false"); };
btn?.addEventListener("click", () => {
  const open = !head.hasAttribute("data-open");
  head.toggleAttribute("data-open", open);
  btn.setAttribute("aria-expanded", String(open));
});
addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
