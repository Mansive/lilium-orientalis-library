export interface Book {
  id: string;
  title: string;
  sources: string[];
  size: number;
  extension: string;
}

export const BOOKS = [
  {
    id: "rec_clo13k3ebat5c83jnr90",
    title: "Kusuriya to Honshin no Kagami",
    sources: ["Nyaa"],
    size: 36.1,
    extension: "rar",
  },
  {
    id: "rec_clo14jbebat5c83jnr9g",
    title: "[白石定規]魔女の旅々３",
    sources: ["TMW Collections"],
    size: 1.52,
    extension: "epub",
  },
  {
    id: "rec_clo0quijp1p3khg20umg",
    title: "魔女の旅々",
    sources: ["Anna's Archive", "Nyaa", "PeepoHappyBooks", "TMW Collections"],
    size: 1.8,
    extension: "azw3",
  },
  {
    id: "rec_clo18m3ebat5c83jolqg",
    title: "俺、ツインテールになります。4.5",
    sources: ["PeepoHappyBooks", "Nyaa"],
    size: 12.3,
    extension: "epub",
  },
  {
    id: "rec_clo0t7bebat5c83jnqog",
    title: "灼眼のシャナXII",
    sources: ["Anna's Archive", "Nyaa", "TMW Collections"],
    size: 24.2,
    extension: "epub",
  },
];
