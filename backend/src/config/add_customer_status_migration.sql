-- Migration to add customer_status columns to orders table
-- Run this SQL if you have an existing database

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS customer_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS customer_status_updated_at TIMESTAMP;

COMMENT ON COLUMN orders.customer_status IS 'Customer pickup status: on-my-way, delayed, wont-make-it';
COMMENT ON COLUMN orders.customer_status_updated_at IS 'Timestamp when customer last updated their status';
