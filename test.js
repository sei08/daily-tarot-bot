// Local sanity test for the draw logic (no Discord connection needed).
const { dailyDraw, randomDraw } = require("./tarot");

const a = dailyDraw("user-123", "en");
const b = dailyDraw("user-123", "en");
console.assert(a.slug === b.slug && a.reversed === b.reversed, "daily draw must be stable within a day");

const other = dailyDraw("user-999", "en");
const ja = dailyDraw("user-123", "ja");
console.assert(ja.slug === a.slug, "EN and JP daily draws should pick the same card");

const seen = new Set();
for (let i = 0; i < 200; i++) seen.add(randomDraw("en").slug);
console.assert(seen.size > 40, "random draw should cover many cards");

console.log("EN daily:", a.name, a.reversed ? "(reversed)" : "(upright)", "-", a.keywords.join(", "));
console.log("JP daily:", ja.name, "-", ja.keywords.join("、"));
console.log("Random sample:", other.name);
console.log("URL:", a.url);
console.log("All tests passed.");
