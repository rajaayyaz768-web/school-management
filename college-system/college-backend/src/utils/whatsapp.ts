/**
 * Generates a WhatsApp click-to-chat link for a given phone number and message.
 * Phone should be in international format without + e.g. "923001234567"
 */
export const generateWhatsAppLink = (
  phone: string,
  message = ""
): string => {
  const cleanPhone = phone.replace(/[^\d]/g, "");
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}${encoded ? `?text=${encoded}` : ""}`;
};
