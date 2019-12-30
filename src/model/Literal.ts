import { DotBase } from '../common';
import { escape, quote } from '../utils/dot-rendering';

/**
 * @category Literal
 */
export class Literal extends DotBase {
  public readonly value: string;

  private isHTMLLike: boolean;
  private isNotString: boolean;
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
        this.isQuoteRequired = /[#\s":;=\-']/g.test(stringValue);
      }
    }
    this.value = stringValue;
  }

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
