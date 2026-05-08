import { useDollarRate } from "@/components/hooks/getDollarRate";

export function useCurrentExchangeRate(): number {
    const { compra, loading, error } = useDollarRate();
    if (loading || error) {
        return 6.96; 
    }
    return compra ?? 6.96; 
}


export function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

export function convertUsdToBs(
  amount: number,
  exchangeRate: number = 6.96
): number {
  return roundToTwo(amount * exchangeRate);
}

export function convertBsToUsd(
  amount: number,
  exchangeRate: number = 6.96
): number {
  return roundToTwo(amount / exchangeRate);
}