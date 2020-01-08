import { DotBase } from '../abstract';
import { IID } from '../types';
import { escape, quote } from '../utils/dot-rendering';

/**
 * An ID is just a value.
 * Designed as an immutable object.
 *
 * @description
 * An ID is one of the following:
 * - Any string of alphabetic ([a-zA-Z\200-\377]) characters, underscores ('_') or digits ([0-9]), not beginning with a digit;
 * - a numeral [-]?(.[0-9]+ | [0-9]+(.[0-9]*)? );
 * - any double-quoted string ("...") possibly containing escaped quotes (\")1;
 * - an HTML string (<...>).
 *
 * @category Internal
 */
export class ID extends DotBase implements IID {
  public readonly value: string;

  /** @hidden */

  private isHTMLLike: boolean;
  /** @hidden */
  private isNotString: boolean;
  /** @hidden */
  private isQuoteRequired: boolean;

  constructor(value: string | number | boolean) {
    super();
    this.isNotString = typeof value !== 'string';
    let stringValue: string = typeof value === 'string' ? value : value.toString();
    if (this.isNotString) {
      this.isHTMLLike = false;
      this.isQuoteRequired = false;
    } else {
      const trimmed = stringValue.trim();
      this.isHTMLLike = /^<.+>$/ms.test(trimmed);
      if (this.isHTMLLike) {
        stringValue = trimmed;
        this.isQuoteRequired = false;
      } else {
        this.isQuoteRequired = /[#\s":;=\-'/]/g.test(stringValue);
      }
    }
    this.value = stringValue;
  }

  /**
   * Determines whether quotes are required or HTML-Like labels and returns an appropriate string.
   */
  public toDot(): string {
    if (this.isNotString || this.isHTMLLike) {
      return this.value;
    }
    let value = this.value;
    if (this.isQuoteRequired) {
      value = quote(escape(value));
    }
    return value;
  }
}
