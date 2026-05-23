# Email Configuration Guide for Domas Ventures E-commerce

This guide provides comprehensive instructions for configuring email notifications for order confirmations and status updates.

## Quick Setup (Gmail - Recommended for Development)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: [https://myaccount.google.com](https://myaccount.google.com)
2. Navigate to **Security** → **2-Step Verification**
3. Turn on 2-Step Verification if not already enabled
4. Follow the setup process (use your phone number for verification)

### Step 2: Generate App Password
1. Still in Google Account → Security → **2-Step Verification**
2. Scroll down and click **App passwords**
3. Click **Select app** → choose **Other (Custom name)**
4. Enter a descriptive name: `Domas Ventures Orders`
5. Click **Generate**
6. Copy the 16-character password (this is your `EMAIL_PASS`)
7. **Important**: Store this password securely, you won't see it again

### Step 3: Configure Environment Variables
Update your `.env` file:

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

### Step 4: Restart Your Server
```bash
npm run dev
```

## Production Email Providers

For production deployment, use a dedicated email service provider for better deliverability, tracking, and reliability.

### SendGrid (Recommended for Production)

#### Why SendGrid?
- Free tier: 100 emails/day
- High deliverability rates
- Email analytics and tracking
- Easy API integration
- Reputation management

#### Setup Steps:
1. **Create Account**: [SendGrid](https://sendgrid.com)
2. **API Key Setup**:
   - Go to **Settings** → **API Keys**
   - Click **Create API Key**
   - Name: `Domas Ventures Production`
   - Permissions: **Restricted Access**
   - Select: `Mail Send` → `Send Mail`
   - Copy the API Key (starts with `SG.`)
3. **Configure Environment Variables**:
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.YOUR_GENERATED_API_KEY_HERE
```
4. **Verify Sender Identity**:
   - Go to **Settings** → **Sender Authentication**
   - Complete either **Single Sender Verification** or **Domain Authentication**
5. **Test Email Delivery**:
   - Use SendGrid's built-in email tester
   - Check your spam folder initially

### Mailgun

#### Why Mailgun?
- 5,000 free emails/month (trial)
- Domain authentication included
- Detailed email logs
- Webhook support for events
- Good for business email domains

#### Setup Steps:
1. **Create Account**: [Mailgun](https://mailgun.com)
2. **Domain Setup**:
   - Add and verify your domain (recommended over sandbox)
   - Add TXT, CNAME, and MX records to your DNS
3. **SMTP Credentials**:
   - Go to **Settings** → **Domains** → Your domain
   - Click **SMTP Authentication**
   - Create SMTP credentials
4. **Configure Environment Variables**:
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@yourdomain.com
EMAIL_PASS=your-mailgun-password
```

### Amazon SES (AWS)

#### Why Amazon SES?
- Pay-as-you-go pricing ($0.10 per 1,000 emails)
- High scalability
- Integration with AWS ecosystem
- Enterprise-grade reliability
- Good for high-volume applications

#### Setup Steps:
1. **AWS Account**: Create account at [AWS](https://aws.amazon.com)
2. **SES Setup**:
   - Navigate to Amazon SES service
   - Verify your sending email address or domain
3. **SMTP Credentials**:
   - Go to **SMTP Settings** → **Create SMTP Credentials**
   - AWS will create an IAM user with restricted permissions
   - Copy Access Key ID and Secret Access Key
4. **Configure Environment Variables**:
```bash
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-aws-access-key-id
EMAIL_PASS=your-aws-secret-access-key
```
5. **Production Access**:
   - Initially in sandbox mode (only verified recipients)
   - Request production access for unlimited sending

## Alternative Email Providers

### Mailjet
- **Setup**: [Mailjet](https://mailjet.com)
- **Free Tier**: 200 emails/day
- **Configuration**:
```bash
EMAIL_HOST=in-v3.mailjet.com
EMAIL_PORT=587
EMAIL_USER=your-mailjet-api-key
EMAIL_PASS=your-mailjet-secret-key
```

### Microsoft Office 365 / Outlook
- **Setup**: Enable POP3/IMAP in Outlook settings
- **Generate App Password** if using 2FA
- **Configuration**:
```bash
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-app-password
```

### Custom SMTP Server
- **Use Case**: Organization's own mail server
- **Configuration**: Obtain details from IT department
```bash
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=587
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-smtp-password
```

## Troubleshooting

### Gmail Specific Issues

**Problem**: "Invalid login" or "Authentication failed"
- **Solution**: 
  - Ensure 2FA is enabled
  - Use the App Password, not your regular password
  - Check for typos in email/app password

**Problem**: "Connection refused" or timeout
- **Solution**:
  - Use port 587 (not 465)
  - Ensure your network allows SMTP connections
  - Check firewall settings

**Problem**: "Self-signed certificate" error
- **Solution**: This is normal with Gmail on port 587 with STARTTLS

### General Email Issues

**Problem**: Emails going to Spam folder
- **Solutions**:
  - For custom domains: Set up SPF, DKIM, and DMARC records
  - For Gmail: Use a dedicated email service for production
  - Check email content: avoid spam trigger words
  - Ensure proper DKIM/SPF authentication

**Problem**: Connection timeout
- **Solutions**:
  - Verify port 587 is not blocked by firewall
  - Check if your ISP blocks SMTP ports
  - Try alternative ports: 2525, 465 (SSL/TLS)

**Problem**: Rate limiting
- **Solutions**:
  - Gmail: Limited to 500 emails/day for free accounts
  - SendGrid: Monitor usage in dashboard
  - Implement queue system for bulk sends
  - Use production provider for high volume

**Problem**: "535 Authentication failed"
- **Solutions**:
  - Double-check username/password
  - For Gmail: Regenerate app password
  - For services: Verify API key is valid
  - Check if credentials have expired

## Testing Email Setup

### Development Testing
1. **Use your personal email** first as a test recipient
2. **Place a test order** on your development environment
3. **Check both inbox and spam folder**
4. **Verify email content** is properly formatted
5. **Test both order placement and confirmation** emails

### Production Testing
1. **Send test emails** using provider's testing tools
2. **Check deliverability** to major providers (Gmail, Outlook, Yahoo)
3. **Monitor email analytics** (bounce rate, open rate)
4. **Test spam filters** using spam checker tools
5. **Setup email bounce handling** for failed deliveries

## Security Best Practices

### Protect Email Credentials
- **Never commit** `.env` file with real credentials
- **Use environment variables** in production (`.env` file should be gitignored)
- **Rotate credentials** periodically
- **Use API keys** with limited permissions when possible

### Email Security
- **Enable TLS/SSL** for all email communications
- **Implement DKIM signing** for domain verification
- **Set up SPF records** to prevent spoofing
- **Configure DMARC** to specify email authentication policy
- **Monitor email reputation** with sending providers

### Monitoring and Logging
- **Track email delivery status**
- **Monitor bounce rates** and spam complaints
- **Implement email webhooks** for real-time events
- **Set up alerts** for delivery failures
- **Review email analytics** regularly

## Email Templates and Content

### Current Email Triggers
1. **Order Placed**: Sent when customer completes checkout
2. **Order Confirmed**: Sent when admin marks order as "Confirmed"

### Email Content Includes
- Order number (ORD-XXXXXXXXXX)
- Customer details (name, email, phone)
- Shipping address
- Order items (product names, sizes, quantities, prices)
- Total amount
- Expected delivery timeline (3 business days)
- Store contact information

### Customizing Email Templates
Email templates are defined in `/server/index.js` in the email sending functions. To customize:
1. **Modify subject lines** for better branding
2. **Update email content** with store-specific messaging
3. **Add HTML formatting** for professional appearance
4. **Include links** to order tracking, store policies, etc.
5. **Add store logo** and brand colors

## Deployment Checklist

### Pre-Deployment
- [ ] Test email functionality in development environment
- [ ] Verify all email triggers work correctly
- [ ] Choose and configure production email provider
- [ ] Set up domain authentication (SPF, DKIM, DMARC)
- [ ] Test email delivery to multiple providers
- [ ] Review email content and templates

### Production Deployment
- [ ] Set environment variables in deployment platform
- [ ] Never commit real credentials to code repository
- [ ] Use production API keys (not development ones)
- [ ] Monitor initial email deliveries closely
- [ ] Set up email delivery monitoring
- [ ] Configure alerts for delivery failures

### Post-Deployment
- [ ] Monitor email deliverability metrics
- [ ] Check spam folder reports
- [ ] Gather customer feedback on email communications
- [ ] Adjust email content based on performance
- [ ] Regularly review email provider usage limits
- [ ] Keep email credentials up to date

## Cost Comparison

| Provider | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| Gmail | 500/day | $6/mo for G Suite | Development, small businesses |
| SendGrid | 100/day | From $19.95/mo | Production, startups |
| Mailgun | 5,000/mo (trial) | From $0.10/1000 | Business domains, moderate volume |
| Amazon SES | 62,000/mo (EC2) | $0.10/1000 | High volume, AWS users |
| Mailjet | 200/day | From $9.65/mo | Small businesses, marketing |

## Additional Resources

- **Email Authentication**: [Google SPF/DKIM Guide](https://support.google.com/a/answer/33786)
- **Email Deliverability**: [SendGrid Deliverability Guide](https://sendgrid.com/docs/for-developers/sending-email/deliverability/)
- **Spam Testing**: [Mail-Tester.com](https://www.mail-tester.com)
- **Email Standards**: [M3AAWG Best Practices](https://www.m3aawg.org)

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review your email provider's documentation
3. Verify environment variables are correctly set
4. Check server logs for error messages
5. Test with simple email client first

For Domas Ventures specific issues, ensure:
- Email provider supports transactional emails
- Your domain is properly authenticated
- Email content meets provider guidelines
- You're within rate limits for your plan