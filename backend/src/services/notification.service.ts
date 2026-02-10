import { sendSms } from '../utils/sms';

export class NotificationService {
  async sendWelcomeSms(phoneNumber: string, name?: string): Promise<void> {
    const greetingName = name ?? 'there';
    await sendSms(phoneNumber, `Welcome to Barberly, ${greetingName}!`);
  }
}

export const notificationService = new NotificationService();
