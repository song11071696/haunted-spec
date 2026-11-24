import { bandInfo } from '../core/index.mjs';

// Moon colour: blood red when cursed (100) -> pale silver when purified (0).
const RED = [179, 0, 27];
const SILVER = [232, 236, 241];

export function moonColor(score) {
  const t = Math.max(0, Math.min(100, score)) / 100;
  const c = SILVER.map((s, i) => Math.round(s + (RED[i] - s) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

export function renderMeter(container, report) {
  const { score, band } = report;
  const info = bandInfo(score);
  const scoreEl = container.querySelector('.score');
  const bandEl = container.querySelector('.band');
  const blurbEl = container.querySelector('.blurb');
  const moon = container.querySelector('.moon');
  if (scoreEl) scoreEl.textContent = String(score);
  if (bandEl) bandEl.textContent = info.name;
  if (blurbEl) blurbEl.textContent = info.blurb;
  if (moon) moon.style.color = moonColor(score);
  container.setAttribute('aria-label', `Haunt score ${score} of 100, ${info.name}`);
  document.body.setAttribute('data-band', band);
}
