/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import mailConfig from "@/components/concierge/mail.json"; // Import email addresses

// Create reusable transporter using SMTP credentials from .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true", // Use SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const { passengers, selectedItinerary, hour, selectedBoat, date } = data;
    const recipientEmails = mailConfig.toAddresses; // Get multiple email addresses

    if (!selectedBoat || !date || recipientEmails.length === 0) {
      return NextResponse.json({ error: "Missing required booking details" }, { status: 400 });
    }

    // Use a fallback if selectedItinerary is undefined
    const itineraryList = (selectedItinerary ?? []) as any[];

    // Format email content
    const emailText = `
      📢 **New Booking Alert** 📢

      🛥️**Boat:** ${selectedBoat.name}
      📅 **Date:** ${date}
      ⏰ **Hour:** ${hour || "Not specified"}

      👥 **Passengers:**
      ${passengers.map((p: any, i: number) => ` ${i + 1}. ${p.fullName} (ID: ${p.idNumber})`).join("\n")}

      🏝️ **Itinerary:**
      ${itineraryList.length > 0 ? itineraryList.map((item: any) => ` - ${item.name}`).join("\n") : "No itinerary selected"}

       Thank you for choosing Sail-E!
    `;

    // Send email to all recipients
    const mailOptions = {
      from: `"Sail-E Bookings" <${process.env.SMTP_USER}>`,
      to: recipientEmails.join(", "), // Send to multiple emails
      subject: "🚢 New Boat Booking Confirmation",
      text: emailText, // Plain text version
      html: `<pre>${emailText}</pre>`, // HTML formatted version
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Booking email sent successfully!" });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
