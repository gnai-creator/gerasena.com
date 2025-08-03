import { FEATURES } from "./features";

// Mock data: 50 past draws with 6 numbers each
export const historico: number[][] = Array.from({ length: 50 }, () => {
  const nums: number[] = [];
  while (nums.length < 6) {
    const n = Math.floor(Math.random() * 60) + 1;
    if (!nums.includes(n)) nums.push(n);
  }
  return nums.sort((a, b) => a - b);
});

// Simple analyzer that just returns all features
export function analyzeHistorico(): string[] {
  return FEATURES;
}
