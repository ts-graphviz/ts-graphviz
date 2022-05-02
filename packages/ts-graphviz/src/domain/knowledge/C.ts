import { createProxy } from './libs/proxy';
import { AttributeDict } from './attribute/assets';

export const attribute = createProxy<AttributeDict>({});
