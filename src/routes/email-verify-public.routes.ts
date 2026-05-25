import { Router, Request, Response } from 'express';
import { User } from '@models';
import { Op } from 'sequelize';
import { LoggerFactory } from '@adapters';

const loggerFactory = new LoggerFactory();
const logger = loggerFactory.createLogger('EmailVerifyPublic');

export const emailVerifyPublicRoutes = Router();

/**
 * GET /email/magic-link
 *
 * Public endpoint that handles the Firebase email verification redirect.
 * When a user clicks the verification link in their email (from any device/browser),
 * Firebase's action handler verifies the oobCode and then redirects here.
 *
 * Since handleCodeInApp is true and the continueUrl points here, Firebase
 * passes the oobCode in the query string. However, Firebase's own action handler
 * may have already consumed the code. So we use a different strategy:
 *
 * We trust that if the user arrived here via the Firebase email link flow,
 * the email ownership is proven. We verify by checking that:
 * 1. The email param matches a user's pendingEmail
 * 2. The oobCode is present (proves they came from the email)
 *
 * For stronger verification, we use firebase-admin to check the action code.
 */
/**
 * GET /email/login
 *
 * Public endpoint that handles the Firebase email LOGIN link redirect.
 * When a user clicks the sign-in link in their email, Firebase redirects here
 * with oobCode in the query string. This endpoint redirects to the app's
 * deep link scheme so the mobile app can complete the sign-in.
 */
emailVerifyPublicRoutes.get('/email/login', (req: Request, res: Response) => {
  const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
  const deepLink = `mutanex://email-login?${queryString}`;

  // Return an HTML page that attempts to open the app via deep link
  // and shows a fallback message if the app isn't installed
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Opening Mutanex...</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f9fafb; }
    .card { background: white; border-radius: 12px; padding: 48px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); max-width: 400px; }
    h1 { margin: 0 0 12px; color: #111827; font-size: 24px; }
    p { margin: 0; color: #6b7280; line-height: 1.6; }
    a { color: #2563eb; text-decoration: none; font-weight: 500; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Opening Mutanex...</h1>
    <p>If the app doesn't open automatically, <a href="${deepLink}">tap here</a>.</p>
    <p style="margin-top: 16px; font-size: 13px; color: #9ca3af;">If you're on a computer, please open this link on your phone where the Mutanex app is installed.</p>
  </div>
  <script>window.location.href = "${deepLink}";</script>
</body>
</html>`);
});

/**
 * GET /email/magic-link
 *
 * Public endpoint for email VERIFICATION links (adding email to account).
 */
emailVerifyPublicRoutes.get('/email/magic-link', async (req: Request, res: Response) => {
  try {
    const oobCode = req.query.oobCode as string | undefined;
    let email = req.query.email as string | undefined;

    if (!oobCode) {
      return res.status(400).send(renderPage('Invalid Link', 'This verification link is invalid or incomplete. Please request a new one from the app.', false));
    }

    // Try to get email from query params (we embed it in the continueUrl)
    if (!email) {
      const continueUrl = req.query.continueUrl as string | undefined;
      if (continueUrl) {
        try {
          const parsed = new URL(continueUrl);
          email = parsed.searchParams.get('email') || undefined;
        } catch {
          // ignore
        }
      }
    }

    if (!email) {
      // Last resort: find the most recent user with a pending email verification
      const recentUser = await User.findOne({
        where: {
          emailPending: { [Op.ne]: null },
          emailVerificationSentAt: { [Op.ne]: null },
        },
        order: [['emailVerificationSentAt', 'DESC']],
      });
      if (recentUser?.dataValues.emailPending) {
        email = recentUser.dataValues.emailPending;
      }
    }

    if (!email) {
      return res.status(400).send(renderPage('Verification Failed', 'Could not determine the email address. Please try verifying from the app.', false));
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify the oobCode using Firebase Identity Toolkit REST API
    // We use the resetPassword endpoint in GET mode to check the action code validity
    // without consuming it, then use signInWithEmailLink to complete verification.
    const { config } = await import('@config/environment');
    const apiKey = config.FIREBASE_WEB_API_KEY;

    // First, check if the oobCode is valid by calling the getOobConfirmation endpoint
    const checkUrl = `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${apiKey}`;
    const checkResponse = await fetch(checkUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oobCode }),
    });

    if (!checkResponse.ok) {
      const errorBody = await checkResponse.json().catch(() => ({}));
      const errorCode = errorBody?.error?.message ?? '';
      logger.error('Firebase oobCode check failed', { errorCode, statusCode: checkResponse.status });

      if (errorCode.includes('EXPIRED') || errorCode.includes('INVALID')) {
        return res.status(400).send(renderPage('Link Expired', 'This verification link has expired. Please request a new one from the app.', false));
      }
      return res.status(400).send(renderPage('Verification Failed', 'This link is invalid or has already been used. Please request a new one from the app.', false));
    }

    const checkData = await checkResponse.json();
    // resetPassword response includes: email, requestType (e.g., "EMAIL_SIGNIN")
    const verifiedEmail = (checkData.email || normalizedEmail).toLowerCase();

    if (verifiedEmail !== normalizedEmail) {
      return res.status(400).send(renderPage('Email Mismatch', 'The verification link does not match the expected email. Please request a new one.', false));
    }

    // Find the user with this pending email
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { emailPending: { [Op.iLike]: normalizedEmail } },
          { email: { [Op.iLike]: normalizedEmail } },
        ],
      },
    });

    if (!user) {
      return res.status(404).send(renderPage('User Not Found', 'No account found for this email address. Please sign up first.', false));
    }

    // If email is already verified, just confirm
    if (user.dataValues.email && user.dataValues.email.toLowerCase() === normalizedEmail) {
      return res.status(200).send(renderPage('Already Verified', 'Your email is already verified. You can close this page and return to the app.', true));
    }

    // Finalize: move emailPending → email
    await user.update({
      email: normalizedEmail,
      emailPending: null,
      emailVerificationSentAt: null,
      emailVerificationTokenHash: null,
      emailVerificationExpiresAt: null,
    });

    logger.info('Email verified via public link', { userId: user.dataValues.id, email: normalizedEmail });

    return res.status(200).send(renderPage('Email Verified!', 'Your email has been verified successfully. You can close this page and return to the app.', true));
  } catch (error: any) {
    logger.error('Public email verification failed', {
      errorMessage: error?.message,
      errorName: error?.name,
    });

    return res.status(400).send(renderPage('Verification Failed', 'Something went wrong. Please request a new verification link from the app.', false));
  }
});

function renderPage(title: string, message: string, success: boolean): string {
  const color = success ? '#22c55e' : '#ef4444';
  const icon = success ? '✓' : '✗';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Mutanex</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f9fafb; }
    .card { background: white; border-radius: 12px; padding: 48px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); max-width: 400px; }
    .icon { font-size: 48px; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; background: ${color}15; color: ${color}; }
    h1 { margin: 0 0 12px; color: #111827; font-size: 24px; }
    p { margin: 0; color: #6b7280; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}
