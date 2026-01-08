/**
 * Hotkey manager with DBeaver-like shortcuts
 */
export class HotkeyManager {
  private handlers: Map<string, () => void> = new Map();
  private isEnabled: boolean = true;

  /**
   * Register a hotkey handler
   */
  register(key: string, handler: () => void): void {
    this.handlers.set(key.toLowerCase(), handler);
  }

  /**
   * Unregister a hotkey handler
   */
  unregister(key: string): void {
    this.handlers.delete(key.toLowerCase());
  }

  /**
   * Enable hotkeys
   */
  enable(): void {
    this.isEnabled = true;
  }

  /**
   * Disable hotkeys
   */
  disable(): void {
    this.isEnabled = false;
  }

  /**
   * Handle keyboard event
   */
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled) {
      return;
    }

    const key = this.getKeyString(event);
    const handler = this.handlers.get(key);

    if (handler) {
      event.preventDefault();
      event.stopPropagation();
      handler();
    }
  }

  /**
   * Convert keyboard event to key string
   */
  private getKeyString(event: KeyboardEvent): string {
    const parts: string[] = [];

    if (event.ctrlKey || event.metaKey) {
      parts.push('ctrl');
    }
    if (event.altKey) {
      parts.push('alt');
    }
    if (event.shiftKey) {
      parts.push('shift');
    }

    // Handle special keys
    if (event.key === 'Enter') {
      parts.push('enter');
    } else if (event.key === 'Escape') {
      parts.push('esc');
    } else if (event.key === 'Tab') {
      parts.push('tab');
    } else if (event.key === 'Backspace') {
      parts.push('backspace');
    } else if (event.key === 'Delete') {
      parts.push('delete');
    } else if (event.key === 'ArrowUp') {
      parts.push('arrowup');
    } else if (event.key === 'ArrowDown') {
      parts.push('arrowdown');
    } else if (event.key.length === 1) {
      parts.push(event.key.toLowerCase());
    } else {
      parts.push(event.key.toLowerCase());
    }

    return parts.join('+');
  }

  /**
   * Get default DBeaver-like hotkeys
   */
  static getDefaultHotkeys(): Record<string, string> {
    return {
      'ctrl+enter': 'Execute query',
      'ctrl+/': 'Comment/uncomment',
      'ctrl+shift+enter': 'Execute all queries',
      'ctrl+shift+c': 'Copy query',
      'ctrl+shift+v': 'Paste query',
      'ctrl+shift+f': 'Format query',
      'ctrl+shift+u': 'Uppercase',
      'ctrl+shift+l': 'Lowercase',
      'ctrl+d': 'Duplicate line',
      'ctrl+l': 'Delete line',
      'ctrl+shift+d': 'Delete line',
      'alt+arrowup': 'Move line up',
      'alt+arrowdown': 'Move line down',
      'ctrl+shift+k': 'Delete line',
      'ctrl+k': 'Delete to end of line',
      'ctrl+shift+i': 'Indent',
      'ctrl+shift+o': 'Outdent',
      'ctrl+space': 'Autocomplete',
      'ctrl+shift+space': 'Show parameters',
      'f5': 'Execute query',
      'ctrl+f': 'Find',
      'ctrl+h': 'Replace',
      'ctrl+g': 'Go to line',
      'ctrl+shift+h': 'Replace in files',
    };
  }
}

