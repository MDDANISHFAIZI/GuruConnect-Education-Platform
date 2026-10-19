import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendMail() {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
     to: 'danish8809506870@gmail.com',
      subject: 'GuruConnect Test Email',
      html: '<h1>Hello from GuruConnect 🚀</h1>'
    });

    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

sendMail();