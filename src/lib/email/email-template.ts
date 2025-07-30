interface QuoteEmailData {
  name: string;
  company: string;
  email: string;
  message?: string;
  customRate: string;
  swatRate: string;
  currency: string;
  calculatorParams?: {
    role?: string;
    workload?: string;
    duration?: string;
    region?: string;
    seniority?: string;
  };
}

export function generateEmailTemplate(data: QuoteEmailData): string {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format the optional message
  const messageSection = data.message 
    ? `
      <tr>
        <td style="padding: 15px 0;">
          <p style="color: #555; font-size: 16px; margin: 0;">
            <strong>Additional Message:</strong><br>
            ${data.message.replace(/\n/g, '<br>')}
          </p>
        </td>
      </tr>
    ` 
    : '';

  // Format calculator parameters if available
  const paramsSection = data.calculatorParams 
    ? `
      <tr>
        <td style="padding: 15px 0; border-top: 1px solid #eee;">
          <h3 style="color: #333; font-size: 18px; margin: 0 0 15px 0;">Calculator Parameters</h3>
          <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
            ${data.calculatorParams.role ? `
              <tr>
                <td style="padding: 5px 0; color: #555; font-size: 14px;"><strong>Role:</strong></td>
                <td style="padding: 5px 0; color: #555; font-size: 14px;">${data.calculatorParams.role}</td>
              </tr>
            ` : ''}
            ${data.calculatorParams.workload ? `
              <tr>
                <td style="padding: 5px 0; color: #555; font-size: 14px;"><strong>Workload:</strong></td>
                <td style="padding: 5px 0; color: #555; font-size: 14px;">${data.calculatorParams.workload}</td>
              </tr>
            ` : ''}
            ${data.calculatorParams.duration ? `
              <tr>
                <td style="padding: 5px 0; color: #555; font-size: 14px;"><strong>Duration:</strong></td>
                <td style="padding: 5px 0; color: #555; font-size: 14px;">${data.calculatorParams.duration}</td>
              </tr>
            ` : ''}
            ${data.calculatorParams.region ? `
              <tr>
                <td style="padding: 5px 0; color: #555; font-size: 14px;"><strong>Region:</strong></td>
                <td style="padding: 5px 0; color: #555; font-size: 14px;">${data.calculatorParams.region}</td>
              </tr>
            ` : ''}
            ${data.calculatorParams.seniority ? `
              <tr>
                <td style="padding: 5px 0; color: #555; font-size: 14px;"><strong>Seniority:</strong></td>
                <td style="padding: 5px 0; color: #555; font-size: 14px;">${data.calculatorParams.seniority}</td>
              </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    ` 
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hub71 Rate Quote</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f5f5f5; padding: 20px;">
        <tr>
          <td>
            <table cellpadding="0" cellspacing="0" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <!-- Header with Logo -->
              <tr>
                <td style="background-color: #0055A4; padding: 30px; text-align: center;">
                  <img src="https://hub71.com/wp-content/uploads/2023/06/hub71-logo-white.png" alt="Hub71 Logo" style="max-width: 180px; height: auto;">
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 30px;">
                  <h1 style="color: #0055A4; font-size: 24px; margin: 0 0 20px 0;">Your Hub71 Rate Quote</h1>
                  
                  <p style="color: #555; font-size: 16px; margin: 0 0 20px 0;">
                    Dear ${data.name},
                  </p>
                  
                  <p style="color: #555; font-size: 16px; margin: 0 0 20px 0;">
                    Thank you for your interest in Hub71's services. Below is the rate quote you requested on ${currentDate}.
                  </p>
                  
                  <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin: 25px 0; background-color: #f9f9f9; border-radius: 6px;">
                    <tr>
                      <td style="padding: 20px;">
                        <h2 style="color: #0055A4; font-size: 20px; margin: 0 0 15px 0;">Rate Quote Summary</h2>
                        
                        <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                              <strong style="color: #333; font-size: 16px;">SWAT Team Rate:</strong>
                            </td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">
                              <span style="color: #0055A4; font-size: 18px; font-weight: bold;">${data.swatRate}</span>
                              <span style="color: #888; font-size: 14px;"> per month</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0;">
                              <strong style="color: #333; font-size: 16px;">Custom Resource Rate:</strong>
                            </td>
                            <td style="padding: 10px 0; text-align: right;">
                              <span style="color: #0055A4; font-size: 18px; font-weight: bold;">${data.customRate}</span>
                              <span style="color: #888; font-size: 14px;"> per month</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                    ${messageSection}
                    ${paramsSection}
                  </table>
                  
                  <p style="color: #555; font-size: 16px; margin: 25px 0 15px 0;">
                    If you have any questions or would like to proceed with these services, please don't hesitate to contact us.
                  </p>
                  
                  <a href="https://hub71.com/contact" style="display: inline-block; background-color: #0055A4; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold; margin-top: 10px;">Contact Us</a>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f0f0f0; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                  <p style="color: #777; font-size: 14px; margin: 0 0 10px 0;">
                    &copy; ${new Date().getFullYear()} Hub71. All rights reserved.
                  </p>
                  <p style="color: #777; font-size: 12px; margin: 0;">
                    This is an automated email. Please do not reply directly to this message.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Function to generate a plain text version of the email for clients that don't support HTML
export function generatePlainTextEmail(data: QuoteEmailData): string {
  console.log(data,"data")
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let plainText = `
HUB71 RATE QUOTE
----------------

Dear ${data.name},

Thank you for your interest in Hub71's services. Below is the rate quote you requested on ${currentDate}.

RATE QUOTE SUMMARY:
------------------
SWAT Team Rate: ${data.swatRate} per month
Custom Resource Rate: ${data.customRate} per month

`;

  if (data.message) {
    plainText += `
ADDITIONAL MESSAGE:
-----------------
${data.message}

`;
  }

  if (data.calculatorParams) {
    plainText += `
CALCULATOR PARAMETERS:
--------------------
${data.calculatorParams.role ? `Role: ${data.calculatorParams.role}\n` : ''}${data.calculatorParams.workload ? `Workload: ${data.calculatorParams.workload}\n` : ''}${data.calculatorParams.duration ? `Duration: ${data.calculatorParams.duration}\n` : ''}${data.calculatorParams.region ? `Region: ${data.calculatorParams.region}\n` : ''}${data.calculatorParams.seniority ? `Seniority: ${data.calculatorParams.seniority}\n` : ''}
`;
  }

  plainText += `
If you have any questions or would like to proceed with these services, please don't hesitate to contact us at https://hub71.com/contact.

© ${new Date().getFullYear()} Hub71. All rights reserved.
This is an automated email. Please do not reply directly to this message.
`;

  return plainText;
}
