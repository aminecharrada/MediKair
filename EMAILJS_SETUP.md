# EmailJS Setup Guide for Darista Contact Form

This guide will help you configure EmailJS to enable the contact form on your website to send emails to contact@darista.tn.

## Prerequisites
- A valid email account (Gmail, Outlook, etc.) with access to contact@darista.tn
- An EmailJS account (free tier available)

## Step-by-Step Setup

### 1. Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click **"Sign Up"** (or **"Get Started"**)
3. Create your account using email or Google authentication

### 2. Add Email Service

Once logged in:

1. Navigate to **"Email Services"** in the left sidebar
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (recommended if using Gmail for contact@darista.tn)
   - **Outlook** (if using Outlook/Hotmail)
   - Or another provider
4. Connect your contact@darista.tn email account:
   - For Gmail: Click **"Connect Account"** and authorize with Google
   - For Outlook: Follow the OAuth flow
5. Once connected, you'll see a **Service ID** (e.g., `service_abc123`)
6. **Copy this Service ID** - you'll need it later

### 3. Create Email Template

1. Navigate to **"Email Templates"** in the left sidebar
2. Click **"Create New Template"**
3. Configure the template:

   **Template Name:** `Contact Form Submission`
   
   **Template Content:**
   ```
   Subject: New Contact Form Message from {{from_name}}
   
   From: {{from_name}}
   Email: {{from_email}}
   Subject: {{subject}}
   
   Message:
   {{message}}
   
   ---
   This message was sent via the Darista contact form.
   ```

4. In the **Settings** tab:
   - **To Email:** contact@darista.tn
   - **From Name:** Darista Contact Form
   - **Reply To:** {{from_email}} (this allows you to reply directly to the customer)

5. **Test** the template by clicking **"Test It"**
6. Once working, note the **Template ID** (e.g., `template_xyz789`)
7. **Copy this Template ID** - you'll need it later

### 4. Get Public Key

1. Navigate to **"Account"** → **"General"** in the left sidebar
2. Find the **"Public Key"** section
3. **Copy your Public Key** (e.g., `1A2B3C4D5E6F7G8H9I`)

### 5. Update Your Code

Now update the ContactPage component with your EmailJS credentials:

**File:** `marque-blanche-ecommerce-main/src/pages/ContactPage/index.js`

Find these lines (around line 35-37):
```javascript
const serviceId = 'YOUR_SERVICE_ID'; // Replace with your EmailJS Service ID
const templateId = 'YOUR_TEMPLATE_ID'; // Replace with your EmailJS Template ID
const publicKey = 'YOUR_PUBLIC_KEY'; // Replace with your EmailJS Public Key
```

Replace them with your actual values:
```javascript
const serviceId = 'service_abc123'; // Your Service ID from step 2
const templateId = 'template_xyz789'; // Your Template ID from step 3
const publicKey = '1A2B3C4D5E6F7G8H9I'; // Your Public Key from step 4
```

### 6. Test the Contact Form

1. Save the changes to ContactPage/index.js
2. Restart your development server if needed
3. Navigate to the Contact page on your website
4. Fill out the form and click **"Send Message"**
5. Check contact@darista.tn inbox for the test message

## Troubleshooting

### Form doesn't send
- Check browser console for errors
- Verify all three credentials (Service ID, Template ID, Public Key) are correct
- Ensure template variables match: `from_name`, `from_email`, `subject`, `message`

### Emails not arriving
- Check spam/junk folder in contact@darista.tn
- Verify the "To Email" in template settings is contact@darista.tn
- Check EmailJS dashboard → "History" to see if emails were sent

### "Forbidden" or "Unauthorized" errors
- Your Public Key might be incorrect
- Your email service might need re-authentication
- Check EmailJS account is active (free tier: 200 emails/month)

## EmailJS Free Tier Limits

- **200 emails per month**
- Sufficient for most small businesses
- Upgrade to paid plan if you need more

## Template Variables Reference

These variables are automatically populated from the contact form:

| Variable | Source |
|----------|--------|
| {{from_name}} | Name field in contact form |
| {{from_email}} | Email field in contact form |
| {{subject}} | Subject field in contact form |
| {{message}} | Message field in contact form |
| {{to_email}} | Hardcoded as contact@darista.tn |

## Security Notes

- The Public Key is safe to include in client-side code
- Do NOT share your Private Key (only used for server-side integrations)
- EmailJS has built-in rate limiting to prevent spam

## Support

- EmailJS Documentation: https://www.emailjs.com/docs/
- EmailJS Support: support@emailjs.com
