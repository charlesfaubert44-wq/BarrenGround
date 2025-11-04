/**
 * Vercel Serverless Function Entry Point
 *
 * This file wraps the Express application for Vercel's serverless environment.
 * All API routes are handled through this single entry point.
 */

import app from '../src/server';

// Export the Express app as a Vercel serverless function
export default app;
