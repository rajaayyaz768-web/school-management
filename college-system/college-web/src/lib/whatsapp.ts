function formatPkPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('92')) return digits
  if (digits.startsWith('0')) return '92' + digits.slice(1)
  return '92' + digits
}

function openWa(phone: string, message: string) {
  const formatted = formatPkPhone(phone)
  const url = `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function sendFeesPaidWhatsApp({
  phone,
  studentName,
  rollNumber,
  className,
  amount,
  month,
  receiptNumber,
  paidAt,
}: {
  phone: string
  studentName: string
  rollNumber: string | null
  className: string
  amount: number
  month: string
  receiptNumber: string | null
  paidAt: string | null
}) {
  const date = paidAt
    ? new Date(paidAt).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })

  const msg =
    `Dear Parent,\n\n` +
    `This is to confirm that the fee for your child has been received.\n\n` +
    `Student: ${studentName}` + (rollNumber ? ` (${rollNumber})` : '') + `\n` +
    `Class: ${className}\n` +
    `Month: ${month}\n` +
    `Amount Paid: PKR ${amount.toLocaleString()}\n` +
    (receiptNumber ? `Receipt No: ${receiptNumber}\n` : '') +
    `Date: ${date}\n\n` +
    `Thank you.`

  openWa(phone, msg)
}

export function sendFeeReminderWhatsApp({
  phone,
  studentName,
  rollNumber,
  balance,
  overdueRecords,
}: {
  phone: string
  studentName: string
  rollNumber: string | null
  balance: number
  overdueRecords: number
}) {
  const msg =
    `Dear Parent,\n\n` +
    `This is a reminder that the fee for your child is overdue.\n\n` +
    `Student: ${studentName}` + (rollNumber ? ` (${rollNumber})` : '') + `\n` +
    `Outstanding Balance: PKR ${balance.toLocaleString()}\n` +
    (overdueRecords > 0 ? `Overdue Records: ${overdueRecords}\n` : '') +
    `\nPlease clear the dues at your earliest convenience.\n\n` +
    `Thank you.`

  openWa(phone, msg)
}

export function sendAbsentWhatsApp({
  phone,
  studentName,
  className,
  subjectName,
  campusName,
  date,
}: {
  phone: string
  studentName: string
  className: string
  subjectName: string
  campusName: string
  date: string
}) {
  const formattedDate = new Date(date).toLocaleDateString('en-PK', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })

  const msg =
    `Dear Parent,\n\n` +
    `This is to inform you that your child was marked absent today.\n\n` +
    `Student: ${studentName}\n` +
    `Class: ${className}\n` +
    `Subject: ${subjectName}\n` +
    `Campus: ${campusName}\n` +
    `Date: ${formattedDate}\n\n` +
    `Please contact the school for more information.\n\n` +
    `Thank you.`

  openWa(phone, msg)
}

export function sendParentChatWhatsApp({
  phone,
  studentName,
  rollNumber,
  className,
}: {
  phone: string
  studentName: string
  rollNumber: string | null
  className: string
}) {
  const msg =
    `Dear Parent,\n\n` +
    `This message is regarding your child:\n\n` +
    `Student: ${studentName}` + (rollNumber ? ` (${rollNumber})` : '') + `\n` +
    `Class: ${className}\n\n`

  openWa(phone, msg)
}
