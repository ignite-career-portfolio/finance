import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function formatCurrency(amount: number) {
  // Tunisian Dinar (TND) has 3 decimal places (millimes)
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 3,
  }).format(amount / 1000); // Assuming amount is in millimes
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
