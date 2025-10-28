import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';
import dotenv from 'dotenv';

dotenv.config();

export async function GET(req) {
  try {
    await connectDB();

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ message: 'No token provided' }),
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return new Response(
        JSON.stringify({ message: 'Invalid token format' }),
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const provider = await ServiceProvider.findOne({ email: decoded.email });

    if (!provider) {
      return new Response(
        JSON.stringify({ message: 'User not found' }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ provider }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Error verifying token:', err);
    return new Response(
      JSON.stringify({ message: 'Invalid or expired token' }),
      { status: 401 }
    );
  }
}
