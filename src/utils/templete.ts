export function generateOtpEmailTemplate(
  email: string,
  otpCode: string,
): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Your OTP Code</title>
    <style>
      body {
        background-color: #f5f5f5;
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
      }
      .email-container {
        width: 100%;
        max-width: 600px;
        background: #ffffff;
        margin: 0 auto;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        padding: 20px;
      }
      .header {
        text-align: center;
        padding-bottom: 20px;
      }
      .content {
        text-align: center;
      }
      .otp-box {
        font-size: 24px;
        font-weight: bold;
        padding: 15px 25px;
        background: #f0f0f0;
        display: inline-block;
        border-radius: 8px;
        margin: 20px 0;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #555;
        text-align: center;
      }
    </style>
  </head>

  <body>
    <center>
      <div class="email-container">


        <div class="content">
          <h2>Your One-Time Password (OTP)</h2>

          <p>Hello <strong>${email}</strong>,</p>

          <p>Use the OTP code below to continue your verification:</p>

          <div class="otp-box">${otpCode}</div>

          <p>This OTP is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
        </div>

        <hr />

        <div class="footer">
          <p>If you didn’t request this OTP, you can safely ignore this email.</p>
        </div>

      </div>
    </center>
  </body>
  </html>
  `;
}
