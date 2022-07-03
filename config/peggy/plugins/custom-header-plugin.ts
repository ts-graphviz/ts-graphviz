import { Pass, Plugin, Config, LocationRange } from 'peggy';

export interface CustomHeaderPluginConfig {
  customHeader: string;
}

export class CustomHeaderPlugin implements Plugin {
  #customHeader: string;

  constructor(config: CustomHeaderPluginConfig) {
    this.#customHeader = config.customHeader;
  }

  get dummyLocation(): LocationRange {
    return {
      source: null,
      start: {
        line: NaN,
        column: NaN,
        offset: NaN,
      },
      end: {
        line: NaN,
        column: NaN,
        offset: NaN,
      },
    };
  }

  get customHeaderPass(): Pass {
    return (ast): void => {
      if (ast.topLevelInitializer) {
        ast.topLevelInitializer.code = [this.#customHeader, ast.topLevelInitializer.code].join('\n');
      } else {
        ast.topLevelInitializer = {
          type: 'top_level_initializer',
          code: this.#customHeader,
          location: this.dummyLocation,
          codeLocation: this.dummyLocation,
        };
      }
    };
  }

  public use(config: Config) {
    config.passes.generate.unshift(this.customHeaderPass);
  }
}
