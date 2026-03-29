
export const bsExchangeRate = 6.96;

export function roundToTwo(value: number): number {
    return Math.round(value * 100) / 100;
}

export function convertUsdToBs(amount: number): number {
    return roundToTwo(amount * bsExchangeRate);
}

export function convertBsToUsd(amount:number): number {
    return roundToTwo(amount / bsExchangeRate);
}