import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customRate, swatRate, customConfig, swatConfig } = body

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Rate Card - Youpal Group</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Arial', sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background: #f8f9fa;
            }
            .container { 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px 20px; 
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 40px; 
              text-align: center; 
              border-radius: 15px 15px 0 0; 
              margin-bottom: 0;
            }
            .header h1 { 
              font-size: 32px; 
              margin-bottom: 10px; 
              font-weight: bold;
            }
            .header p { 
              font-size: 16px; 
              opacity: 0.9; 
            }
            .content { 
              background: white; 
              padding: 40px; 
              border-radius: 0 0 15px 15px; 
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .calculator { 
              background: #f8f9fa; 
              padding: 30px; 
              margin: 30px 0; 
              border-radius: 12px; 
              border-left: 5px solid #3b82f6;
            }
            .calculator h2 { 
              color: #1e293b; 
              margin-bottom: 20px; 
              font-size: 24px;
            }
            .rate { 
              font-size: 36px; 
              font-weight: bold; 
              color: #3b82f6; 
              text-align: center; 
              margin: 25px 0; 
              padding: 20px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
            }
            .config { 
              background: white; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 15px 0;
            }
            .config-item { 
              display: flex; 
              justify-content: space-between; 
              margin: 8px 0; 
              padding: 5px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .config-item:last-child { 
              border-bottom: none; 
            }
            .config-label { 
              font-weight: 600; 
              color: #475569;
            }
            .config-value { 
              color: #1e293b;
            }
            .discount-note { 
              background: #fef3c7; 
              color: #92400e; 
              padding: 12px; 
              border-radius: 6px; 
              margin-top: 15px; 
              font-size: 14px;
              border-left: 4px solid #f59e0b;
            }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              padding-top: 30px; 
              border-top: 2px solid #e2e8f0; 
              color: #64748b;
            }
            .footer h3 { 
              color: #1e293b; 
              margin-bottom: 15px;
            }
            .contact-info { 
              margin: 10px 0; 
              font-size: 14px;
            }
            .generated-date {
              position: absolute;
              top: 20px;
              right: 20px;
              font-size: 12px;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div class="generated-date">
            Generated: ${new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          
          <div class="container">
            <div class="header">
              <h1>🚀 you gig × HUB71</h1>
              <p>Professional Rate Card Quote</p>
            </div>
            
            <div class="content">
              <div class="calculator">
                <h2>🎯 SWAT Team Calculator</h2>
                <div class="rate">${swatRate}</div>
                <div class="config">
                  <div class="config-item">
                    <span class="config-label">Role:</span>
                    <span class="config-value">${swatConfig.role}</span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">Workload:</span>
                    <span class="config-value">${swatConfig.workload}</span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">Duration:</span>
                    <span class="config-value">${swatConfig.duration}</span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">Currency:</span>
                    <span class="config-value">${swatConfig.currency}</span>
                  </div>
                </div>
                <div class="discount-note">
                  ✨ Includes 20% pre-negotiated SWAT team discount
                </div>
              </div>

              <div class="calculator">
                <h2>🌍 Custom Resource Calculator</h2>
                <div class="rate">${customRate}</div>
                <div class="config">
                  <div class="config-item">
                    <span class="config-label">Region:</span>
                    <span class="config-value">${customConfig.region}</span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">Role:</span>
                    <span class="config-value">${customConfig.role}</span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">Seniority:</span>
                    <span class="config-value">${customConfig.seniority}</span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">Currency:</span>
                    <span class="config-value">${customConfig.currency}</span>
                  </div>
                </div>
              </div>

              <div class="footer">
                <h3>Ready to Get Started?</h3>
                <div class="contact-info">
                  <p><strong>Youpal Group</strong> | Powered by Hub71</p>
                  <p>📧 khan@volods.com | taimur@youpal.se</p>
                  <p>🌐 ratecard.youpalgroup.se</p>
                </div>
                <p style="margin-top: 20px; font-size: 12px;">
                  Rate Card for Hub71 - 2025 | All rates are monthly and subject to terms and conditions
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Replace this with your API2PDF API key
    const apiKey = process.env.API2PDF_KEY || 'YOUR_API2PDF_KEY'
    
    console.log("Using API key:", apiKey.substring(0, 3) + "..." + apiKey.substring(apiKey.length - 3))
    
    // Call the API2PDF service
    const response = await fetch('https://v2018.api2pdf.com/chrome/html', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: html,
        inlinePdf: false, // Changed to false to use URL method instead
        fileName: `rate-card-${Date.now()}.pdf`,
        options: {
          format: "A4",
          printBackground: true,
          margin: {
            top: "20px",
            right: "20px",
            bottom: "20px",
            left: "20px",
          }
        }
      }),
    })

    const result = await response.json()
    console.log("API2PDF response:", JSON.stringify(result))
    
    if (!result.success) {
      console.error("API2PDF error:", result.error || "Unknown error")
      throw new Error('PDF generation failed: ' + (result.error || "Unknown error"))
    }
    
    // Use the PDF URL from the response
    if (result.pdf) {
      // Fetch the PDF from the URL
      const pdfResponse = await fetch(result.pdf)
      const pdfBlob = await pdfResponse.arrayBuffer()
      
      return new NextResponse(pdfBlob, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="rate-card-${Date.now()}.pdf"`,
        },
      })
    } else {
      throw new Error('PDF URL not found in API2PDF response')
    }
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate PDF: " + error.message }, { status: 500 })
  }
}
