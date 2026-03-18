/**
 * AIKA World — SDK initialization
 * Single instance shared across the app.
 */
import { AikaSDK } from '@aika/sdk';

const sdk = AikaSDK.init({
  key: 'aika-world',
  title: 'Aika World',
  description: { en: 'Space colonization strategy', hu: '\u0170r koloniz\u00e1ci\u00f3s strat\u00e9gia' },
  icon: String.fromCodePoint(0x1F680),
  theme: 'space',
  access_type: 'free',
  version: '3.0.5',
});

export default sdk;
