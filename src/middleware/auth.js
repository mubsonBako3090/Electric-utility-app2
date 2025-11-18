
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import connectDB from "@/lib/database";
import User from "@/models/User";

// Require authentication and return user from DB
export async function requireAuth(request) {
  await connectDB();
  // Use authenticateToken logic to get decoded user
  const token = cookies().get("token")?.value;
  if (!token) throw new Error("Access token required");
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (e) {
    throw new Error("Invalid or expired token");
  }
  // Find user in DB
  const user = await User.findById(decoded.userId);
  if (!user) throw new Error("User not found");
  return user;
}

export async function authenticateToken() {
  try {
    // Read HTTP-only cookie
    const token = cookies().get("token")?.value;

    if (!token) {
      return {
        success: false,
        error: "Access token required",
        status: 401
      };
    }

    const decoded = verifyToken(token);

    return {
      success: true,
      user: decoded
    };

  } catch (error) {
    return {
      success: false,
      error: "Invalid or expired token",
      status: 401
    };
  }
}
