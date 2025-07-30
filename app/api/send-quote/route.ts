import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateEmailTemplate, generatePlainTextEmail } from '@/lib/email/email-template';

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { 
      name, 
      email, 
      company, 
      message, 
      customRate, 
      swatRate, 
      currency,
      calculatorParams 
    } = body;

    // Validate required fields
    if (!name || !email || !customRate || !swatRate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create email data object
    const emailData = {
      name,
      email,
      company,
      message,
      customRate,
      swatRate,
      currency,
      calculatorParams
    };

    // Generate email content
    const htmlContent = generateEmailTemplate(emailData);
    const textContent = generatePlainTextEmail(emailData);

    // Check if Gmail credentials are available
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;
    
    let transporter;
    let mailOptions;
    let info;
    
    if (gmailUser && gmailPass) {
      // Create a transporter using Gmail
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });
      
      // Set up email options for Gmail
      mailOptions = {
        from: `"Hub71 Calculator" <${gmailUser}>`,
        to: email,
        subject: 'Your Hub71 Rate Quote',
        text: textContent,
        html: htmlContent,
      };
      
      // Add BCC if configured
      if (process.env.EMAIL_BCC) {
        mailOptions.bcc = process.env.EMAIL_BCC;
      }
      
      // Send the email using Gmail
      info = await transporter.sendMail(mailOptions);
      
      // Log success message
      console.log('Email sent successfully to:', email);
      console.log('Message ID:', info.messageId);
      
      // Return success response
      return NextResponse.json({ 
        success: true, 
        message: 'Quote sent successfully',
        id: info.messageId
      });
    } else {
      // Fallback to Ethereal for testing if Gmail credentials are not available
      console.log('Gmail credentials not found. Falling back to Ethereal for testing.');
      
      // Create a test account using Ethereal
      const testAccount = await nodemailer.createTestAccount();
      console.log('Created Ethereal test account:', testAccount.user);

      // Create a transporter using the test account
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      // Set up email options for Ethereal
      mailOptions = {
        from: `"Hub71 Calculator" <${testAccount.user}>`,
        to: email,
        subject: 'Your Hub71 Rate Quote',
        text: textContent,
        html: htmlContent,
      };

      // Add BCC if configured
      if (process.env.EMAIL_BCC) {
        mailOptions.bcc = process.env.EMAIL_BCC;
      }

      // Send the email using Ethereal
      info = await transporter.sendMail(mailOptions);
      
      // Log success message and preview URL
      console.log('Email sent successfully to Ethereal for testing');
      console.log('Message ID:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

      // Return success response with preview URL for testing
      return NextResponse.json({ 
        success: true, 
        message: 'Quote sent successfully (test mode)',
        id: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info),
        testMode: true
      });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send quote' },
      { status: 500 }
    );
  }
}
