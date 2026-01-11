/**
 * Keyboard shortcut utility functions
 */

/**
 * Parse a keyboard shortcut string into modifiers and key
 * Examples: "Alt+Shift+d" -> { alt: true, shift: true, key: "d" }
 */
export function parseShortcut(shortcut: string): {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  key: string;
} {
  const parts = shortcut.split('+').map((p) => p.trim());
  const modifiers = {
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
    key: '',
  };

  parts.forEach((part) => {
    const lower = part.toLowerCase();
    if (lower === 'ctrl' || lower === 'control') {
      modifiers.ctrl = true;
    } else if (lower === 'alt' || lower === 'option') {
      modifiers.alt = true;
    } else if (lower === 'shift') {
      modifiers.shift = true;
    } else if (lower === 'meta' || lower === 'cmd' || lower === 'command') {
      modifiers.meta = true;
    } else {
      modifiers.key = part;
    }
  });

  return modifiers;
}

/**
 * Check if a keyboard event matches a shortcut string
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parsed = parseShortcut(shortcut);

  // Check modifiers
  if (event.ctrlKey !== parsed.ctrl) return false;
  if (event.altKey !== parsed.alt) return false;
  if (event.shiftKey !== parsed.shift) return false;
  if (event.metaKey !== parsed.meta) return false;

  // Check key (case-insensitive for letters)
  const eventKey = event.key;
  const shortcutKey = parsed.key;

  if (eventKey.toLowerCase() === shortcutKey.toLowerCase()) {
    return true;
  }

  return false;
}

/**
 * Format a shortcut string for display
 * Examples: "Alt+Shift+d" -> "Alt+Shift+D"
 */
export function formatShortcut(shortcut: string): string {
  const parts = shortcut.split('+').map((p) => p.trim());
  return parts
    .map((part) => {
      const lower = part.toLowerCase();
      if (lower === 'ctrl' || lower === 'control') return 'Ctrl';
      if (lower === 'alt' || lower === 'option') return 'Alt';
      if (lower === 'shift') return 'Shift';
      if (lower === 'meta' || lower === 'cmd' || lower === 'command') return 'Cmd';
      // Capitalize single letters, keep special keys as-is
      if (part.length === 1) return part.toUpperCase();
      return part;
    })
    .join('+');
}

/**
 * Validate a keyboard shortcut string
 */
export function isValidShortcut(shortcut: string): boolean {
  if (!shortcut || shortcut.trim() === '') return false;

  const parsed = parseShortcut(shortcut);

  // Must have a key
  if (!parsed.key) return false;

  // Key should not be a modifier
  const keyLower = parsed.key.toLowerCase();
  if (
    keyLower === 'ctrl' ||
    keyLower === 'control' ||
    keyLower === 'alt' ||
    keyLower === 'option' ||
    keyLower === 'shift' ||
    keyLower === 'meta' ||
    keyLower === 'cmd' ||
    keyLower === 'command'
  ) {
    return false;
  }

  return true;
}
