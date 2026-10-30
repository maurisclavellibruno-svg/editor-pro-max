// Stamps needed before a cut is free — the 6th stamp is the free one.
export const LOYALTY_CARD_GOAL = 6;

// Stamps 1 through 5 must happen within this many days of the first one, or
// the cycle resets to 0. The goal isn't "reward loyalty whenever it
// happens" — it's "get people back in the chair sooner".
export const LOYALTY_CARD_WINDOW_DAYS = 60;
