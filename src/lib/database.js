import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mubarakadambako_db_user:IanQeCirB584fQGj@cluster0.ulhx10f.mongodb.net/electric_utility?retryWrites=true&w=majority';

if (!MONGODB_URI) {
  throw new Error(
    '❌ Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global cache for mongoose connection to prevent multiple connections
 * during hot reloads in development
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { 
    conn: null, 
    promise: null,
    connected: false
  };
}

/**
 * Database connection function with connection pooling and error handling
 */
async function connectDB() {
  // Return cached connection if available and connected
  if (cached.conn && cached.connected) {
    console.log('✅ Using cached MongoDB connection');
    return cached.conn;
  }

  // If connection is in progress, wait for it
  if (cached.promise) {
    console.log('🔄 MongoDB connection in progress, waiting...');
    return await cached.promise;
  }

  // Connection options for MongoDB Atlas
  const opts = {
    bufferCommands: false, // Disable mongoose buffering
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 15000, // Keep trying to send operations for 15 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4, // Use IPv4, skip trying IPv6
    retryWrites: true,
    w: 'majority'
  };

  console.log('🔄 Attempting to connect to MongoDB Atlas...');

  try {
    // Create connection promise
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('✅ MongoDB Atlas connected successfully!');
        
        // Set connection status
        cached.connected = true;
        
        // Set up connection event handlers
        const db = mongooseInstance.connection;
        
        db.on('error', (error) => {
          console.error('❌ MongoDB connection error:', error);
          cached.connected = false;
          cached.conn = null;
          cached.promise = null;
        });

        db.on('disconnected', () => {
          console.log('⚠ MongoDB disconnected');
          cached.connected = false;
          cached.conn = null;
          cached.promise = null;
        });

        db.on('reconnected', () => {
          console.log('✅ MongoDB reconnected');
          cached.connected = true;
        });

        // Handle application termination
        process.on('SIGINT', async () => {
          try {
            await mongooseInstance.connection.close();
            console.log('✅ MongoDB connection closed through app termination');
            process.exit(0);
          } catch (error) {
            console.error('❌ Error closing MongoDB connection:', error);
            process.exit(1);
          }
        });

        return mongooseInstance;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection failed:', error);
        
        // Reset cache on connection failure
        cached.promise = null;
        cached.conn = null;
        cached.connected = false;
        
        throw new Error(`Database connection failed: ${error.message}`);
      });

    // Wait for connection and cache it
    cached.conn = await cached.promise;
    return cached.conn;

  } catch (error) {
    // Reset cache on any error
    cached.promise = null;
    cached.conn = null;
    cached.connected = false;
    
    console.error('❌ Failed to establish MongoDB connection:', error);
    throw error;
  }
}

/**
 * Health check function to verify database connection
 */
export async function checkDatabaseHealth() {
  try {
    const conn = await connectDB();
    const adminDb = conn.connection.db.admin();
    const result = await adminDb.ping();
    
    if (result.ok === 1) {
      return {
        status: 'healthy',
        message: 'Database connection is active',
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        status: 'unhealthy',
        message: 'Database ping failed',
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Database health check failed: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Close database connection (useful for testing)
 */
export async function closeDatabase() {
  try {
    if (cached.conn) {
      await mongoose.connection.close();
      cached.conn = null;
      cached.promise = null;
      cached.connected = false;
      console.log('✅ MongoDB connection closed successfully');
    }
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
}

/**
 * Get database connection status
 */
export function getConnectionStatus() {
  return {
    connected: cached.connected,
    hasConnection: !!cached.conn,
    hasPendingConnection: !!cached.promise
  };
}

/**
 * Database connection middleware for API routes
 */
export function withDatabase(handler) {
  return async (req, res) => {
    try {
      await connectDB();
      return handler(req, res);
    } catch (error) {
      console.error('Database connection error in API route:', error);
      return res.status(503).json({
        success: false,
        error: 'Service temporarily unavailable. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
}

export default connectDB;