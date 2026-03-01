import mongoose from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";

/**
 * One-time admin endpoint to fix stale non-sparse indexes on homeowners collection.
 * This fixes the E11000 duplicate key error when phone-only users sign up (email: null).
 * 
 * Call this once: POST /api/admin/fix-indexes
 * After running, you can delete this file.
 */
export async function POST(req) {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    const collection = db.collection('homeowners');
    const indexes = await collection.indexes();
    
    const results = [];
    
    for (const idx of indexes) {
      // Skip the default _id index
      if (idx.name === '_id_') continue;
      
      const isEmailIndex = idx.key?.email !== undefined;
      const isPhoneIndex = idx.key?.phone !== undefined;
      
      if ((isEmailIndex || isPhoneIndex) && idx.unique && !idx.sparse) {
        const fieldName = isEmailIndex ? 'email' : 'phone';
        try {
          await collection.dropIndex(idx.name);
          results.push(`✅ Dropped non-sparse index '${idx.name}' on '${fieldName}'`);
        } catch (err) {
          results.push(`❌ Failed to drop '${idx.name}': ${err.message}`);
        }
      } else {
        results.push(`⏭️ Skipped index '${idx.name}' (${JSON.stringify(idx.key)}) - OK`);
      }
    }
    
    // Now recreate the correct sparse indexes
    try {
      await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
      results.push('✅ Created sparse unique index on email');
    } catch (err) {
      results.push(`⚠️ Email index: ${err.message}`);
    }
    
    try {
      await collection.createIndex({ phone: 1 }, { unique: true, sparse: true });
      results.push('✅ Created sparse unique index on phone');
    } catch (err) {
      results.push(`⚠️ Phone index: ${err.message}`);
    }
    
    // Also clean up any homeowners with email: null (set to undefined/unset)
    const cleanupResult = await collection.updateMany(
      { email: null },
      { $unset: { email: "" } }
    );
    results.push(`🧹 Cleaned ${cleanupResult.modifiedCount} homeowners with email:null (unset email field)`);
    
    const cleanupPhoneResult = await collection.updateMany(
      { phone: null },
      { $unset: { phone: "" } }
    );
    results.push(`🧹 Cleaned ${cleanupPhoneResult.modifiedCount} homeowners with phone:null (unset phone field)`);
    
    // Get final indexes
    const finalIndexes = await collection.indexes();
    
    return NextResponse.json({
      success: true,
      message: "Index fix completed",
      results,
      finalIndexes: finalIndexes.map(i => ({ name: i.name, key: i.key, unique: i.unique, sparse: i.sparse }))
    });
    
  } catch (err) {
    console.error("Fix indexes error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
