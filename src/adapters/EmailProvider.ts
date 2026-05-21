import { BrevoClient } from '@getbrevo/brevo';
import { config } from '@config/environment';
import { InternalServerError, ServiceUnavailableError } from '@errors';

type SendEmailInput = {
	to: string;
	templateId?: number;
	subject?: string;
	htmlContent?: string;
	textContent?: string;
	params?: Record<string, unknown>;
};

type BrevoSendResponse = {
	body?: {
		messageId?: string;
	};
};

export class EmailProvider {
	private readonly client: BrevoClient;
	private readonly senderEmail: string;
	private readonly senderName: string;

	constructor() {
		const apiKey = config.BREVO_API_KEY;
		if (!apiKey) {
			throw new ServiceUnavailableError('BREVO_API_KEY is not configured');
		}

		this.client = new BrevoClient({ apiKey });
		this.senderEmail = config.BREVO_SENDER_EMAIL;
		this.senderName = config.BREVO_SENDER_NAME;
	}

	async sendEmail(input: SendEmailInput): Promise<{ messageId: string }> {
		try {
			const response = (await this.client.transactionalEmails.sendTransacEmail({
				to: [{ email: input.to }],
				templateId: input.templateId,
				subject: input.subject,
				htmlContent: input.htmlContent,
				textContent: input.textContent,
				params: input.params,
				sender: {
					email: this.senderEmail,
					name: this.senderName,
				},
			})) as BrevoSendResponse;

			return {
				messageId: response.body?.messageId || '',
			};
		} catch (error) {
			throw new InternalServerError(error instanceof Error ? error.message : 'Failed to send email');
		}
	}

	async sendVerificationEmail(email: string, verificationLink: string): Promise<{ messageId: string }> {
		return this.sendEmail({
			to: email,
			subject: 'Verify your email address',
			htmlContent: `<p>Please verify your email address by clicking <a href="${verificationLink}">this link</a>.</p>`,
			textContent: `Please verify your email address: ${verificationLink}`,
		});
	}
}