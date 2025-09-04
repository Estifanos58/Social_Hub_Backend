export const VERIFICATIONTOKEN = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SocialHub Verification</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #fafafa;
      color: #262626;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      background-color: #fff;
      border: 1px solid #dbdbdb;
      border-radius: 8px;
      padding: 30px;
    }
    .logo {
      text-align: center;
      font-size: 28px;
      font-weight: bold;
      color: #262626;
      margin-bottom: 20px;
    }
    .title {
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 10px;
    }
    .message {
      font-size: 14px;
      text-align: center;
      color: #262626;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .code {
      display: block;
      text-align: center;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 6px;
      color: #262626;
      border: 1px solid #dbdbdb;
      border-radius: 8px;
      padding: 15px 0;
      margin: 0 auto 20px;
      width: 200px;
    }
    .footer {
      font-size: 12px;
      text-align: center;
      color: #999;
      margin-top: 20px;
    }
    @media (max-width: 600px) {
      .container { padding: 20px; }
      .code { font-size: 28px; letter-spacing: 4px; width: 180px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">SocialHub</div>
    <div class="title">Your Verification Code</div>
    <div class="message">
      Use the verification code below to verify your account. <br>
      This code will expire in <strong>15 minutes</strong>.
    </div>
    <div class="code">{code}</div>
    <div class="message">
      If you didn't request this, you can safely ignore this email.
    </div>
    <div class="footer">
      &copy; {year} SocialHub. All rights reserved.
    </div>
  </div>
</body>
</html>
`

export const EMAILVERIFIED = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SocialHub - Verification Confirmed</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #fafafa;
      color: #262626;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      background-color: #fff;
      border: 1px solid #dbdbdb;
      border-radius: 8px;
      padding: 30px;
    }
    .logo {
      text-align: center;
      font-size: 28px;
      font-weight: bold;
      color: #262626;
      margin-bottom: 20px;
    }
    .title {
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 10px;
      color: #262626;
    }
    .message {
      font-size: 14px;
      text-align: center;
      color: #262626;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .checkmark {
      text-align: center;
      font-size: 48px;
      color: #4BB543;
      margin-bottom: 20px;
    }
    .footer {
      font-size: 12px;
      text-align: center;
      color: #999;
      margin-top: 20px;
    }
    @media (max-width: 600px) {
      .container { padding: 20px; }
      .checkmark { font-size: 40px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">SocialHub</div>
    <div class="checkmark">&#10004;</div>
    <div class="title">Verification Successful!</div>
    <div class="message">
      Your email has been successfully verified. <br>
      You can now start using SocialHub and enjoy connecting with friends and communities.
    </div>
    <div class="footer">
      &copy; {year} SocialHub. All rights reserved.
    </div>
  </div>
</body>
</html>
`

export const FORGOTPASSWORD = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SocialHub - Reset Your Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #fafafa;
      color: #262626;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      background-color: #fff;
      border: 1px solid #dbdbdb;
      border-radius: 8px;
      padding: 30px;
    }
    .logo {
      text-align: center;
      font-size: 28px;
      font-weight: bold;
      color: #262626;
      margin-bottom: 20px;
    }
    .title {
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 10px;
      color: #262626;
    }
    .message {
      font-size: 14px;
      text-align: center;
      color: #262626;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .token-box {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      background: #f7f7f7;
      padding: 12px 20px;
      border-radius: 6px;
      border: 1px solid #dbdbdb;
      margin: 20px auto;
      display: inline-block;
      letter-spacing: 2px;
    }
    .footer {
      font-size: 12px;
      text-align: center;
      color: #999;
      margin-top: 20px;
    }
    @media (max-width: 600px) {
      .container { padding: 20px; }
      .token-box { font-size: 18px; padding: 10px 16px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">SocialHub</div>
    <div class="title">Reset Your Password</div>
    <div class="message">
      Hi <strong>{firstname}</strong>, <br><br>
      We received a request to reset your SocialHub password. <br>
      Use the following code to reset your password (expires in 15 minutes):
    </div>
    <div class="token-box">{resetToken}</div>
    <div class="message">
      If you didn’t request this, you can safely ignore this email.
    </div>
    <div class="footer">
      &copy; {year} SocialHub. All rights reserved.
    </div>
  </div>
</body>
</html>
`