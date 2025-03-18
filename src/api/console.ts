export const printMessage = (message: string) => {
  const shouldSuppressConsoleReports =
    process.env.SUPPRESS_CONSOLE_REPORTS === "true"
  if (shouldSuppressConsoleReports) return
  console.log(message)
}
