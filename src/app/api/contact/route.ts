import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" }, 
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" }, 
        { status: 400 }
      );
    }
    
    // Here you can add logic to:
    // 1. Save to database
    // 2. Send email notification
    // 3. Send to admin panel
    // For now, we'll just return success
    
    console.log("New contact message:", { name, email, subject, message });
    
    return NextResponse.json({ 
      success: true,
      message: "Pesan berhasil dikirim. Kami akan merespons segera."
    });
    
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Gagal mengirim pesan" }, 
      { status: 500 }
    );
  }
}