export function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function toApiDateTime(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

export function addBillingCycle(startDate: Date, billingCycle?: string) {
  const endDate = new Date(startDate);

  if (billingCycle === "yearly") {
    endDate.setFullYear(endDate.getFullYear() + 1);
    return endDate;
  }

  endDate.setMonth(endDate.getMonth() + 1);
  return endDate;
}
