// Pure gift rules shared by the LIVE server and Node unit tests.
// Source of truth for display effects. Coin/diamond values come from each TikTok event,
// never from hardcoded marketplace prices (prices/available gifts vary).
export const HIGH_GIFT_MIN = 500;
export const GIFT_TIERS = Object.freeze([
  { key: 'basic',   min: 0,     level: 0, durationMs: 1600, auraMs: 0,       rewardMs: 0,      title: '',                    outfit: 'default',    prop: 'none' },
  { key: 'regular', min: 99,    level: 1, durationMs: 2600, auraMs: 0,       rewardMs: 0,      title: '',                    outfit: 'default',    prop: 'none' },
  { key: 'high',    min: 500,   level: 2, durationMs: 3600, auraMs: 30000,   rewardMs: 30000,  title: 'Tri ân người đồng hành',outfit: 'gold-trim',  prop: 'beads' },
  { key: 'vip',     min: 1000,  level: 3, durationMs: 5000, auraMs: 120000,  rewardMs: 900000, title: 'Sen vàng tri ân',      outfit: 'lotus-robe', prop: 'lantern' },
  { key: 'elite',   min: 3000,  level: 4, durationMs: 6500, auraMs: 180000,  rewardMs: 0,      title: 'Tấm lòng đồng hành',  outfit: 'silk-robe',  prop: 'lotus-throne' },
  { key: 'legend',  min: 10000, level: 5, durationMs: 8500, auraMs: 300000,  rewardMs: 0,      title: 'Đại tri ân',          outfit: 'grand-robe', prop: 'grand-lotus' },
]);
export const GIFT_CATALOG = Object.freeze([
  { key: 'rose',        names: ['hoa hong', 'rose'],                 effect: 'lotus',        action: 'bow' },
  { key: 'tiktok',      names: ['tiktok'],                          effect: 'sparkle',      action: 'bow' },
  { key: 'gg',          names: ['gg'],                              effect: 'sparkle',      action: 'bow' },
  { key: 'heart',       names: ['heart me', 'heartme'],             effect: 'heart',        action: 'hands' },
  { key: 'fingerheart', names: ['finger heart'],                   effect: 'lotus',        action: 'hands' },
  { key: 'rosa',        names: ['rosa'],                            effect: 'lotus',        action: 'offer' },
  { key: 'perfume',     names: ['nuoc hoa', 'perfume'],             effect: 'incense',      action: 'incense' },
  { key: 'donut',       names: ['banh donut', 'doughnut', 'donut'],  effect: 'halo',         action: 'hands' },
  { key: 'crane',       names: ['hac giay', 'paper crane'],         effect: 'cranes',       action: 'offer' },
  { key: 'confetti',    names: ['confetti'],                        effect: 'petals',       action: 'bow' },
  { key: 'butterfly',   names: ['butterfly for you', 'butterfly'],    effect: 'butterflies',  action: 'offer' },
  { key: 'corgi',       names: ['corgi'],                           effect: 'lantern',      action: 'hands' },
  { key: 'moneygun',    names: ['money gun', 'sung tien'],          effect: 'gold-petals',  action: 'offer' },
  { key: 'swan',        names: ['swan', 'thien nga'],              effect: 'water',        action: 'bow' },
  { key: 'galaxy',      names: ['galaxy', 'thien ha'],              effect: 'galaxy',       action: 'stand-bow' },
  { key: 'fireworks',   names: ['fireworks', 'phao hoa'],           effect: 'fireworks',    action: 'stand-bow' },
  { key: 'whale',       names: ['whale diving'],                   effect: 'water',        action: 'stand-bow' },
  { key: 'meteor',      names: ['meteor shower', 'mua sao bang'],  effect: 'meteor',       action: 'offer' },
  { key: 'interstellar',names: ['interstellar'],                   effect: 'galaxy',       action: 'stand-bow' },
  { key: 'lion',        names: ['lion', 'su tu'],                   effect: 'gold-petals',  action: 'stand-bow' },
  { key: 'universe',    names: ['tiktok universe', 'universe'],     effect: 'grand-lotus',  action: 'stand-bow' },
]);
const cleanName = value => String(value ?? '').normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd')
  .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
export function getGiftTier(value) {
  const amount = Math.max(0, Number(value) || 0);
  return [...GIFT_TIERS].reverse().find(tier => amount >= tier.min) || GIFT_TIERS[0];
}
export function findGift(name) {
  const normalized = cleanName(name);
  return GIFT_CATALOG.find(g => g.names.some(alias => normalized === alias)) || null;
}
export function giftEvent(name, value, at = Date.now()) {
  const tier = getGiftTier(value);
  const gift = findGift(name);
  const effect = gift?.effect || (tier.level >= 5 ? 'grand-lotus'
    : tier.level >= 4 ? 'galaxy' : tier.level >= 3 ? 'lantern'
    : tier.level >= 2 ? 'lotus' : 'petals');
  return {
    key: gift?.key || 'generic',
    name: String(name || 'Quà tặng').slice(0, 30),
    effect,
    action: gift?.action || (tier.level >= 4 ? 'stand-bow' : 'hands'),
    tier: tier.key,
    level: tier.level,
    title: tier.title,
    outfit: tier.outfit,
    prop: tier.prop,
    durationMs: tier.durationMs,
    auraUntil: tier.auraMs ? at + tier.auraMs : 0,
    // 0 indicates the reward stays for the current LIVE server session.
    rewardUntil: tier.level >= 2 ? (tier.rewardMs ? at + tier.rewardMs : 0) : null,
  };
}
export function getSeatCapacity(mode, viewersCount) {
  const n = Number(viewersCount) || 0;
  const fixed = [24, 36, 64, 100].includes(Number(mode)) && mode !== 'auto';
  if (fixed) return Number(mode);
  return [24, 36, 64, 100].find(cap => n <= cap) || 100;
}
