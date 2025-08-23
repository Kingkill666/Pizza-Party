// Placeholder for utils module
// TODO: Implement real utility functions as needed

// Simple classNames utility (cn)
export function cn(...args: any[]): string {
  return args.filter(Boolean).join(' ')
}

export const formatWallet = (wallet: string | null, length = 6): string =>
  wallet ? `${wallet.slice(0, length)}...${wallet.slice(-4)}` : 'N/A';
