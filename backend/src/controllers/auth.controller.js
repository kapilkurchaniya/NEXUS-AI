import UserModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export async function register(req, res) {
    const { username, email, password } = req.body;

    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ username, email, password: hashedPassword });
    await user.save();


    const verifytoken = jwt.sign(
  { id: user._id, email: user.email },
  JWT_SECRET
);

const verifyLink = `http://localhost:3000/api/auth/verify-email?token=${verifytoken}`;

  await sendEmail({
  to: email,
  subject: "Welcome to Our Platform 🚀",
  html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
      
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; text-align: center; color: white;">
          <h2 style="margin: 0;">Welcome, ${username}! 🎉</h2>
          <p style="margin: 5px 0 0;">We're glad to have you here</p>
        </div>

        <!-- Body -->
        <div style="padding: 25px; color: #333;">
          
          <p style="font-size: 15px;">
            Thank you for joining our platform. Your account has been successfully created,
            and you're now ready to explore everything we offer.
          </p>

          <p style="font-size: 15px;">
            We’re committed to giving you the best experience. Start exploring features,
            connect, and make the most of your journey with us.
          </p>

          <br/>

          <p style="font-size: 15px; font-weight: bold;">
            To verify your email address, please click the button below:
          </p>

         <div style="margin: 25px 0;">
  <table width="100%" role="presentation" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <a href="${verifyLink}" style="
          background: #667eea;
          color: white;
          padding: 12px 25px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          display: inline-block;
        ">
          Verify Email ✅
        </a>
      </td>
    </tr>
  </table>
</div>

          <p style="font-size: 14px; color: #555;">
            If you have any questions, feel free to reach out anytime.
          </p>

          <br/>

          <p style="margin: 0;">Best regards,</p>
          <p style="margin: 5px 0;"><strong>Kapil Kurchaniya</strong></p>
        </div>

        <!-- Footer -->
        <div style="background: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777;">
          © ${new Date().getFullYear()} All rights reserved.<br/>
          This is an automated email, please do not reply.
        </div>

      </div>
    </div>
  `
});

    res.status(201).json({ message: "User registered successfully", success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  }

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email }).select("+password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (!user.verified) {
    return res.status(403).json({ message: "Email not verified" });
  }

  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
res.status(200).json({ message: "Login successful", success: true, user: { id: user._id, username: user.username, email: user.email } });
}

export async function verifyEmail(req, res) {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await UserModel.findById(decoded.id);  
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    user.verified = true;

    await user.save();

const html = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
    
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
      
      <div style="padding: 30px; text-align: center;">  

        <h2 style="color: #4CAF50; margin-bottom: 20px;">
          Email Verified Successfully! 🎉
        </h2>

        <p style="font-size: 16px; color: #333;">
          Thank you for verifying your email address. Your account is now active and ready to use.
        </p>

        <p style="font-size: 16px; color: #333;">
          Login to your account using the email and password you provided during registration.
        </p>

        <div style="margin: 25px 0;">
          <a href="http://localhost:3000/" style="
            background: #667eea;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            display: inline-block;
          ">
            Login Now 🚀
          </a>
        </div>

        <p style="font-size: 16px; color: #333;">
          You can now explore all the features we have to offer. If you have any questions, feel free to reach out to our support team.
        </p>

        <p style="font-size: 16px; color: #333;">
          Welcome aboard, and we look forward to seeing you around!
        </p>

        <br/>

        <p style="margin: 0;">Best regards,</p>
        <p style="margin: 5px 0;"><strong>Kapil Kurchaniya</strong></p>

      </div>

    </div>

  </div>
`;

    res.status(200).send(html);
  }   catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
}

export async function getMe(req, res) {
  const userid= req.user.id;
  const User = await UserModel.findById(userid);
  if (!User) {
    return res.status(404).json({ message: "User not found"});
  }

  res.status(200).json({ message: "User found", User}); 
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
const resetLink = `http://localhost:5173/reset-password?token=${token}`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
      
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
        
        <div style="padding: 30px; text-align: center;">
          <h2 style="color: #4CAF50; margin-bottom: 20px;">
            Password Reset Request 🔐
          </h2>
          <p style="font-size: 16px; color: #333;">
            We received a request to reset your password. Click the button below to proceed.
          </p>
          <div style="margin: 25px 0;">
            <a href="${resetLink}" style="
              background: #667eea;
              color: white;
              padding: 12px 25px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              display: inline-block;
            ">
              Reset Password
            </a>
          </div>
          <p style="font-size: 16px; color: #333;">
            If you did not request a password reset, please ignore this email or contact support if you have questions.
          </p>
          <p style="font-size: 16px; color: #333;">
            Best regards,
          </p>
          <p style="margin: 5px 0;"><strong>Kapil Kurchaniya</strong></p>
        </div>
      </div>
    </div>

  `;  

  await sendEmail({
    to: email,
    subject: "Password Reset Request",
    html
  });

  res.status(200).json({ message: "Password reset email sent" });
}

export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await UserModel.findById(decoded.id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
}






