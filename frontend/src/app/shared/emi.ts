export interface EmiResult {
  principal: number;
  emi: number;
  total: number;
}

/** Standard reducing-balance EMI: P·r·(1+r)^n / ((1+r)^n − 1), with r the monthly rate. */
export function calculateEmi(principal: number, annualRatePercent: number, months: number): EmiResult | null {
  if (!(principal > 0) || !(months > 0) || !(annualRatePercent >= 0)) return null;
  const r = annualRatePercent / 12 / 100;
  const emi = r === 0 ? principal / months : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  return { principal, emi, total: emi * months };
}
