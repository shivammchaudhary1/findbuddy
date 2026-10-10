export function fixtureObjectId(sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 0) {
    throw new RangeError("Fixture sequence must be a non-negative integer");
  }

  return sequence.toString(16).padStart(24, "0").slice(-24);
}

export function fixtureDate(dayOffset = 0): Date {
  return new Date(Date.UTC(2026, 0, 1 + dayOffset, 12, 0, 0));
}
