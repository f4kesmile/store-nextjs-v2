import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("favicon") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (allow .ico, .png)
    const allowedTypes = ['image/x-icon', 'image/vnd.microsoft.icon', 'image/png'];
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.ico')) {
      return NextResponse.json({ error: "File must be .ico or .png format" }, { status: 400 });
    }

    // Validate file size (max 2MB for favicon)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 2MB allowed for favicon" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });
    
    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.toLowerCase().endsWith('.ico') ? 'ico' : 'png';
    const filename = `favicon-${timestamp}.${extension}`;
    const filepath = path.join(uploadDir, filename);
    
    // Write file
    await writeFile(filepath, bytes);
    
    return NextResponse.json({ 
      faviconPath: `/uploads/${filename}`,
      success: true,
      message: "Favicon uploaded successfully"
    });
    
  } catch (error) {
    console.error("Favicon upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload favicon" }, 
      { status: 500 }
    );
  }
}