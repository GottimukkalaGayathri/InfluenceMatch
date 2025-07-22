const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter with Gmail configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'influencematch.notify@gmail.com',
        pass: 'vdleauqdmjtzbepd' 
    },
    secure: true
});

// Test the connection
transporter.verify(function(error, success) {
    if (error) {
        console.log('Email configuration error:', error);
    } else {
        console.log('Email server is ready to take our messages');
    }
});

// Send email function
const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: {
                name: 'InfluenceMatch',
                address: 'influencematch.notify@gmail.com'
            },
            to,
            subject,
            html
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error: error.message };
    }
};

// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Email templates
const emailTemplates = {
    passwordResetOTP: (otp, name) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #2563eb, #1e40af); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; margin-bottom: 10px;">IM</div>
                    <h1 style="color: #2563eb; margin: 10px 0;">InfluenceMatch</h1>
                </div>
                <h2 style="color: #2563eb; text-align: center;">Password Reset OTP</h2>
                <p>Hello ${name || 'User'},</p>
                <p>You requested a password reset for your InfluenceMatch account.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <div style="display: inline-block; background: #f3f4f6; padding: 20px 30px; border-radius: 10px; font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px;">${otp}</div>
                </div>
                <p style="text-align: center; color: #666;">This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="text-align: center; color: #666; font-size: 14px;">Best regards,<br>InfluenceMatch Team</p>
            </div>
        </div>
    `,
    
    brandApproval: (name, email, password) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; margin-bottom: 10px;">IM</div>
                    <h1 style="color: #10b981; margin: 10px 0;">InfluenceMatch</h1>
                </div>
                <h2 style="color: #10b981; text-align: center;">Brand Request Approved!</h2>
                <p>Hello ${name},</p>
                <p>Great news! Your brand request has been approved by our admin team.</p>
                <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #10b981; margin-top: 0;">Your Login Credentials:</h3>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Password:</strong> ${password}</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:3000/login" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Login to Dashboard</a>
                </div>
                <p>Start creating campaigns and connecting with influencers today!</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="text-align: center; color: #666; font-size: 14px;">Best regards,<br>InfluenceMatch Team</p>
            </div>
        </div>
    `,

    campaignInvitation: (influencerName, brandName, campaignTitle) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; margin-bottom: 10px;">IM</div>
                    <h1 style="color: #f59e0b; margin: 10px 0;">InfluenceMatch</h1>
                </div>
                <h2 style="color: #f59e0b; text-align: center;">Campaign Invitation!</h2>
                <p>Hello ${influencerName},</p>
                <p>You have been invited by <strong>${brandName}</strong> to participate in the campaign:</p>
                <div style="background: #fffbeb; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                    <h3 style="color: #f59e0b; margin-top: 0;">${campaignTitle}</h3>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:3000/influencer-dashboard" style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">View Invitation</a>
                </div>
                <p>Login to your dashboard to view the invitation details and respond.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="text-align: center; color: #666; font-size: 14px;">Best regards,<br>InfluenceMatch Team</p>
            </div>
        </div>
    `
};

module.exports = { sendEmail, generateOTP, emailTemplates };