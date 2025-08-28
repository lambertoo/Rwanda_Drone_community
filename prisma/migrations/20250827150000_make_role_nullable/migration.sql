-- Add hobbyist role to UserRole enum
ALTER TYPE "UserRole" ADD VALUE 'hobbyist';

-- Make the role field nullable in the users table
ALTER TABLE "users" ALTER COLUMN "role" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT; 