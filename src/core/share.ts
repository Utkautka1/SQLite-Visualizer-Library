/**
 * Query sharing utility - generates shareable links
 */
export class QueryShareManager {
  /**
   * Generate shareable link with encoded query
   */
  generateShareLink(query: string, baseUrl: string = window.location.origin): string {
    const encoded = this.encodeQuery(query);
    return `${baseUrl}?query=${encoded}`;
  }

  /**
   * Decode query from shareable link
   */
  decodeFromUrl(url: string = window.location.href): string | null {
    try {
      const urlObj = new URL(url);
      const encoded = urlObj.searchParams.get('query');
      if (!encoded) {
        return null;
      }
      return this.decodeQuery(encoded);
    } catch (error) {
      console.error('Failed to decode query from URL:', error);
      return null;
    }
  }

  /**
   * Encode query for URL
   */
  private encodeQuery(query: string): string {
    // Use base64 encoding for better compatibility
    try {
      return btoa(encodeURIComponent(query));
    } catch (error) {
      // Fallback to simple encoding
      return encodeURIComponent(query);
    }
  }

  /**
   * Decode query from URL
   */
  private decodeQuery(encoded: string): string {
    try {
      return decodeURIComponent(atob(encoded));
    } catch (error) {
      // Fallback to simple decoding
      return decodeURIComponent(encoded);
    }
  }

  /**
   * Copy shareable link to clipboard
   */
  async copyToClipboard(query: string, baseUrl?: string): Promise<boolean> {
    try {
      const link = this.generateShareLink(query, baseUrl);
      await navigator.clipboard.writeText(link);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
}

