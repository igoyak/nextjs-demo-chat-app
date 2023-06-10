export function fuzzyTime(diffSeconds: number): string {
  if (diffSeconds < 45) {
    return "a few seconds ago"
  } else if (diffSeconds < 90) {
    return "a minute ago"
  } else if (diffSeconds < 45 * 60) {
    return `${Math.round(diffSeconds / 60)} minutes ago`
  } else if (diffSeconds < 90 * 60) {
    return `an hours ago`
  } else {
    return `${Math.round(diffSeconds / 60 / 60)} hours ago`
  }
}

