// Daily Tarot — Discord fortune bot
// Commands:
//   /tarot [language]  Today's card for you (one per day, resets 00:00 UTC)
//   /draw  [language]  A free one-card draw, any time
// Language: en (default) or ja.
require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  SlashCommandBuilder,
  REST,
  Routes,
} = require("discord.js");
const { dailyDraw, randomDraw } = require("./tarot");

const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) {
  console.error("DISCORD_TOKEN is not set. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

const LANG_CHOICES = [
  { name: "English", value: "en" },
  { name: "日本語", value: "ja" },
];

const commands = [
  new SlashCommandBuilder()
    .setName("tarot")
    .setDescription("Draw your tarot card for today 🔮")
    .addStringOption((o) =>
      o.setName("language").setDescription("Language").addChoices(...LANG_CHOICES)
    ),
  new SlashCommandBuilder()
    .setName("draw")
    .setDescription("Draw one random tarot card, any time ✨")
    .addStringOption((o) =>
      o.setName("language").setDescription("Language").addChoices(...LANG_CHOICES)
    ),
].map((c) => c.toJSON());

const TEXT = {
  en: {
    dailyTitle: "Your card for today",
    drawTitle: "Your card",
    reversed: "Reversed",
    upright: "Upright",
    keywords: "Keywords",
    advice: "Advice",
    more: "Read the full meaning",
    footer: "Daily Tarot — for entertainment",
  },
  ja: {
    dailyTitle: "今日のあなたのカード",
    drawTitle: "引いたカード",
    reversed: "逆位置",
    upright: "正位置",
    keywords: "キーワード",
    advice: "アドバイス",
    more: "詳しい意味はこちら",
    footer: "Daily Tarot — エンタメとしてお楽しみください",
  },
};

function toEmbed(result, kind) {
  const t = TEXT[result.lang];
  const siteName =
    result.lang === "ja" ? "SHIMAのタロット辞典" : "SHIMA Tarot Dictionary";
  const embed = new EmbedBuilder()
    .setColor(result.reversed ? 0x8e6cc8 : 0xf2b134)
    .setTitle(
      `${result.symbol} ${result.name} — ${result.reversed ? t.reversed + " 🔄" : t.upright}`
    )
    .setURL(result.url)
    .setDescription(result.meaning)
    .setImage(result.image)
    .addFields(
      { name: t.keywords, value: result.keywords.join(" / ") },
      ...(result.advice ? [{ name: t.advice, value: result.advice }] : []),
      { name: t.more, value: `[${siteName}](${result.url})` }
    )
    .setFooter({ text: t.footer });
  embed.setAuthor({ name: kind === "daily" ? t.dailyTitle : t.drawTitle });
  return embed;
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log("Slash commands registered.");
  } catch (err) {
    console.error("Failed to register slash commands:", err);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const lang = interaction.options.getString("language") || "en";
  if (interaction.commandName === "tarot") {
    const result = dailyDraw(interaction.user.id, lang);
    await interaction.reply({ embeds: [toEmbed(result, "daily")] });
  } else if (interaction.commandName === "draw") {
    const result = randomDraw(lang);
    await interaction.reply({ embeds: [toEmbed(result, "draw")] });
  }
});

client.login(TOKEN);
