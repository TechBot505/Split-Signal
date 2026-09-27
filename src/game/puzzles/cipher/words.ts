/**
 * ~126 common, family-friendly words grouped by length (5–7 letters).
 * Grouping by length lets the generator build "similar" decoy candidate lists.
 */
export const WORDS_BY_LENGTH: Record<number, readonly string[]> = {
  5: [
    "about", "above", "actor", "adobe", "agile", "alarm", "album", "alien",
    "alley", "amber", "angel", "apple", "arena", "arrow", "aside", "atlas",
    "azure", "beach", "beard", "bench", "berry", "birch", "black", "blaze",
    "bloom", "board", "bonus", "brave", "bread", "brick", "bring", "broad",
    "brush", "cabin", "cable", "camel", "candy", "chair", "charm", "chess",
    "cliff", "cloud",
  ],
  6: [
    "anchor", "animal", "appeal", "arctic", "artist", "aspect", "autumn", "banana",
    "basket", "beacon", "bishop", "bottle", "breeze", "bridge", "bright", "bronze",
    "bubble", "bucket", "camera", "candle", "canvas", "canyon", "carbon", "career",
    "castle", "cellar", "cherry", "circle", "clever", "cloudy", "clover", "cobalt",
    "coffee", "comedy", "copper", "cotton", "cradle", "crayon", "custom", "damage",
    "dazzle", "desert",
  ],
  7: [
    "admiral", "amazing", "anchovy", "antenna", "aquatic", "awesome", "balloon", "banquet",
    "bargain", "battery", "blanket", "blossom", "bravery", "cabinet", "capture", "caramel",
    "cascade", "catalog", "ceramic", "chamber", "channel", "chapter", "cheetah", "chimney",
    "circuit", "citizen", "classic", "cluster", "compass", "concert", "contact", "cottage",
    "courage", "crimson", "crystal", "cushion", "cyclone", "diamond", "dolphin", "drizzle",
    "eclipse", "evening",
  ],
};

export const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
