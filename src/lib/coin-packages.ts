export interface CoinPackage {
  id: string
  amount: number
  bonus: number
  price: number
  popular?: boolean
  badge?: string
}

export const COIN_PACKAGES: CoinPackage[] = [
  { id: 'starter', amount: 100, bonus: 0, price: 99 },
  { id: 'basic', amount: 500, bonus: 50, price: 499 },
  { id: 'popular', amount: 1000, bonus: 150, price: 899, popular: true, badge: 'Most Popular' },
  { id: 'premium', amount: 2000, bonus: 400, price: 1699, badge: 'Best Value' },
  { id: 'ultimate', amount: 5000, bonus: 1500, price: 3999, badge: 'Ultimate' },
]

export function getPackageById(id: string): CoinPackage | null {
  return COIN_PACKAGES.find((p) => p.id === id) ?? null
}
