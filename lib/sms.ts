// Mock SMS service - replace with actual Twilio implementation
export async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  // For development, just log the OTP
  console.log(`📱 SMS to ${phoneNumber}: ${message}`)

  // In production, use Twilio:
  /*
  const twilio = require('twilio')
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    })
    return true
  } catch (error) {
    console.error('SMS Error:', error)
    return false
  }
  */

  return true // Mock success
}
