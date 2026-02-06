-- Drop existing enums and recreate with correct case for CockroachDB
-- Note: DROP TYPE CASCADE will drop dependent objects

DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "Difficulty" CASCADE;
DROP TYPE IF EXISTS "ChallengeDifficulty" CASCADE;
DROP TYPE IF EXISTS "MentorshipStatus" CASCADE;
DROP TYPE IF EXISTS "ProfileVisibility" CASCADE;
DROP TYPE IF EXISTS "VoteType" CASCADE;
DROP TYPE IF EXISTS "EmailFrequency" CASCADE;

-- Recreate with exact case (CockroachDB requires lowercase for enum values in some cases)
CREATE TYPE "Role" AS ENUM ('LEARNER', 'MENTOR', 'ADMIN');
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE "ChallengeDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE "MentorshipStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'DECLINED');
CREATE TYPE "ProfileVisibility" AS ENUM ('PUBLIC', 'PRIVATE');
CREATE TYPE "VoteType" AS ENUM ('UPVOTE', 'DOWNVOTE');
CREATE TYPE "EmailFrequency" AS ENUM ('INSTANT', 'DAILY', 'WEEKLY');
