// Tarot draw logic for the Discord tarot bot.
// Data: 78 cards in EN and JP, copied from the tarot dictionary sites.
const crypto = require("crypto");
const cardsEn = require("./data/cards-en.json");
const cardsJp = require("./data/cards-jp.json");

const SITES = {
  en: "https://shima-tarot-dictionary.pages.dev",
  ja: "https://shima-tarot-jiten.pages.dev",
};

// Card artwork (Rider-Waite) is hosted on the English dictionary site;
// the Japanese site carries no image files, so both languages use it.
const IMAGE_BASE = "https://shima-tarot-dictionary.pages.dev/images";

function deck(lang) {
  return lang === "ja" ? cardsJp : cardsEn;
}

function cardName(card, lang) {
  return lang === "ja" ? `${card.name_ja}（${card.name_en}）` : card.name;
}

function cardUrl(card, lang) {
  return `${SITES[lang]}/cards/${card.slug}.html`;
}

// Deterministic daily draw: same user + same UTC date = same card all day.
function dailyDraw(userId, lang = "en", now = new Date()) {
  const dateKey = now.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  const hash = crypto
    .createHash("sha256")
    .update(`tarot:${userId}:${dateKey}`)
    .digest();
  const idx = hash.readUInt16BE(0) % 78;
  const reversed = hash[2] % 4 === 0; // ~25% reversed
  return buildResult(deck(lang)[idx], reversed, lang);
}

// Free draw: a fresh random card every time.
function randomDraw(lang = "en") {
  const idx = crypto.randomInt(0, 78);
  const reversed = crypto.randomInt(0, 4) === 0;
  return buildResult(deck(lang)[idx], reversed, lang);
}

function shorten(text, max = 320) {
  if (!text) return "";
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("。"));
  return (lastStop > 80 ? cut.slice(0, lastStop + 1) : cut.trim()) + " …";
}

function buildResult(card, reversed, lang) {
  const keywords = reversed ? card.keywords_reversed : card.keywords_upright;
  const meaning = reversed ? card.reversed : card.upright;
  return {
    slug: card.slug,
    symbol: card.symbol || "🔮",
    name: cardName(card, lang),
    reversed,
    keywords,
    meaning: shorten(meaning),
    advice: card.advice || "",
    url: cardUrl(card, lang),
    image: `${IMAGE_BASE}/${reversed ? "framed-rev" : "framed"}/${card.slug}.jpg`,
    lang,
  };
}

module.exports = { dailyDraw, randomDraw };
