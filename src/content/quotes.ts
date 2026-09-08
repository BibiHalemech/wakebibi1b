import { publicUrl } from "../publicUrl";
import { loadSettings } from "../systems/settings";
import { strings } from "./strings.he";

export type QuoteRecord = {
  id: string;
  speaker: string;
  text: string;
  date: string;
  source: string;
  source_url: string;
  context: string;
  enabled: boolean;
  verified: boolean;
};

export type QuoteCard = {
  id?: string;
  text: string;
  source: string;
  source_url?: string;
};

type QuotesFile = {
  quotes: QuoteRecord[];
};

let playable: QuoteRecord[] = [];
let deck: QuoteCard[] = [];
let cursor = 0;
let stirDeck: QuoteCard[] = [];
let stirCursor = 0;

export function isPlayableQuote(value: unknown): value is QuoteRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    record.enabled === true &&
    record.verified === true &&
    typeof record.text === "string" &&
    record.text.trim().length > 0
  );
}

export function filterPlayableQuotes(raw: unknown[]): QuoteRecord[] {
  return raw.filter(isPlayableQuote);
}

export function clearQuotesCache(): void {
  playable = [];
  deck = [];
  cursor = 0;
  stirDeck = [];
  stirCursor = 0;
}

export async function loadQuotes(): Promise<QuoteRecord[]> {
  try {
    const response = await fetch(publicUrl("content/quotes.json"));
    if (!response.ok) {
      playable = [];
      return playable;
    }
    const data = (await response.json()) as QuotesFile;
    playable = filterPlayableQuotes(Array.isArray(data.quotes) ? data.quotes : []);
  } catch {
    playable = [];
  }
  return playable;
}

export function getPlayableQuotes(): readonly QuoteRecord[] {
  return playable;
}

export function beginQuoteSession(): void {
  const cards =
    !loadSettings().noPoliticalQuotes && playable.length > 0
      ? sortById(playable).map(toCard)
      : [...strings.genericQuote];
  deck = [...cards];
  cursor = 0;
  stirDeck = [...cards];
  stirCursor = 0;
}

export function nextQuote(): QuoteCard {
  if (deck.length === 0) {
    beginQuoteSession();
  }
  const card = deck[cursor % deck.length];
  cursor += 1;
  return card;
}

export function nextStirQuote(): QuoteCard | null {
  if (stirDeck.length === 0) {
    beginQuoteSession();
  }
  if (stirCursor >= stirDeck.length) {
    return null;
  }
  const card = stirDeck[stirCursor];
  stirCursor += 1;
  return card;
}

export function hasMoreStirQuotes(): boolean {
  return stirCursor < stirDeck.length;
}

export function quoteHref(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function toCard(quote: QuoteRecord): QuoteCard {
  const source = quote.source.trim() || quote.speaker.trim() || strings.quoteSourceFallback;
  const date = quote.date.trim();
  return {
    id: quote.id,
    text: quote.text,
    source: date ? `${source} · ${date}` : source,
    source_url: quote.source_url.trim() || undefined,
  };
}

function sortById(quotes: readonly QuoteRecord[]): QuoteRecord[] {
  return [...quotes].sort((a, b) => {
    const left = Number(a.id);
    const right = Number(b.id);
    if (Number.isFinite(left) && Number.isFinite(right)) {
      return left - right;
    }
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });
}
