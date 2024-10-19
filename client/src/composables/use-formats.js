export function useDate(date) {
  let updatedAt = new Date(date)
  return `${updatedAt.getDate()}/${updatedAt.getMonth() + 1}/${updatedAt.getFullYear()}`
}

export const useLocaleDate = (
  value,
  options = {
    separator: '/',
    format: 'dd-mm-yyyy',
    useAbbreviations: true
  }
) => {
  const date = new Date(value)
  if (!date) return value

  options = { ...options }

  const selectedFormat = options.format || 'dd-mm-yyyy'
  let day, month, year
  /* const days = options.useAbbreviations ?
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] :
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] */

  const months = options.useAbbreviations
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : [
      'January',
      'Febuary',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ]

  const [, m, y] = selectedFormat.split('-')

  day = date.getDate()

  if (m === 'mm') month = date.getMonth() + 1
  else if (m === 'MM') month = months[date.getMonth()]
  else month = date.getMonth()

  if (y === 'yy') year = date.getFullYear().slice(1)
  else if (y === 'yyyy') year = date.getFullYear()
  else year = date.getFullYear()

  const localeDate = day + options.separator + month + options.separator + year
  return localeDate
}

