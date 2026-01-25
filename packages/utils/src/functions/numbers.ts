/**
 * Converts a numeric value into a percentage string with a specified number of decimal places.
 *
 * @param {number} amount The numeric value to convert to a percentage.
 * @param {number} [decimals=2] The number of decimal places to include in the resulting percentage string.
 * @returns {string} The formatted percentage string.
 */
export const toPercentage = (amount: number, decimals = 2) =>
  `${(amount * 100).toFixed(decimals)}%`

/**
 * Formats a numeric amount as a currency string using the specified currency code and number of decimal places.
 *
 * @param {number} amount The numeric value to format.
 * @param {string} [currency='USD'] The ISO 4217 currency code to use for formatting.
 * @param {number} [decimals=0] The maximum number of fraction digits to use in the formatted string.
 * @returns {string} The formatted currency string.
 */
export const toCurrency = (
  amount: number,
  currency = "USD",
  decimals = 0,
  locale = "en"
) => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: decimals,
  }).format(amount)
}
