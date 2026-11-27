export const ROUTES = Object.freeze({
  business: 'Overview',
  prototype: 'Gen 1 prototype',
  markets: 'Markets',
  partners: 'Partners',
  incentives: 'Incentives',
  investors: 'Investors',
  enterprise: 'Enterprise'
});
export function routeName(path) {
  const key = path.replace(/^\/+|\/+$/g, '');
  return Object.hasOwn(ROUTES, key) ? key : 'business';
}
