/** Rating scale shared by the feedback pages; the API stores 1..5. */
export const RATING_EMOJIS: ReadonlyArray<{ value: number; emoji: string; label: string }> = [
  { value: 1, emoji: '😡', label: 'Very unhappy' },
  { value: 2, emoji: '😕', label: 'Unhappy' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '😊', label: 'Happy' },
  { value: 5, emoji: '😍', label: 'Very happy' },
];

export function emojiFor(rating: number): string {
  return RATING_EMOJIS.find((r) => r.value === rating)?.emoji ?? '❔';
}
