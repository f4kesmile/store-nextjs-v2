// src/app/api/upload/route.ts - GANTI DENGAN KODE INI
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Upload request received');
    
    const data = await request.formData();
    console.log('📋 FormData parsed');
    
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      console.log('❌ No file in FormData');
      console.log('📝 FormData keys:', Array.from(data.keys()));
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    console.log('📁 File info:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Invalid file type:', file.type);
      return NextResponse.json({ 
        error: `Tipe file tidak didukung: ${file.type}. Hanya JPEG, PNG, WebP, dan GIF yang diizinkan` 
      }, { status: 400 });
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ File too large:', file.size);
      return NextResponse.json({ 
        error: `File terlalu besar: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maksimal 5MB` 
      }, { status: 400 });
    }

    // Check if file has content
    if (file.size === 0) {
      console.log('❌ Empty file');
      return NextResponse.json({ 
        error: 'File kosong atau tidak valid' 
      }, { status: 400 });
    }

    console.log('✅ File validation passed');

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('📦 File converted to buffer, size:', buffer.length);

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name) || '.jpg';
    const baseName = path.basename(file.name, fileExtension).replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${baseName}${fileExtension}`;

    console.log('📝 Generated filename:', filename);

    // Pastikan folder uploads/products ada
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    await mkdir(uploadDir, { recursive: true });
    console.log('📁 Upload directory ready:', uploadDir);

    // Simpan file
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);
    console.log('💾 File saved to:', filepath);

    // Return URL path relatif
    const imageUrl = `/uploads/products/${filename}`;

    console.log('✅ Upload successful:', imageUrl);
    return NextResponse.json({ 
      message: 'File berhasil diupload', 
      imageUrl,
      filename,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('💥 Upload error:', error);
    return NextResponse.json({ 
      error: 'Gagal upload file: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
