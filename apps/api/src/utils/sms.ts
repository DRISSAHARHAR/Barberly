export async function sendSms(to: string, message: string): Promise<void> {
  // Integrate real provider (Twilio, Vonage, etc.) here.
  // This is a placeholder implementation for architecture scaffolding.
  console.info(`SMS queued for ${to}: ${message}`);
}
