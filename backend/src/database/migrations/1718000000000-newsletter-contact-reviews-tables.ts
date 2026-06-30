import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates tables that were previously only provisioned via TypeORM synchronize in development.
 * Required for production/staging where synchronize is disabled.
 */
export class NewsletterContactReviewsTables1718000000000 implements MigrationInterface {
  name = 'NewsletterContactReviewsTables1718000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_newsletter_subscribers_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_newsletter_subscribers_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "contact_submissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "subject" character varying,
        "message" text NOT NULL,
        "budget" character varying,
        "is_read" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_contact_submissions_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "destination_reviews" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "destination_id" uuid NOT NULL,
        "user_id" uuid,
        "author_name" character varying NOT NULL,
        "rating" integer NOT NULL,
        "body" text NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_destination_reviews_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_destination_reviews_destination_id"
      ON "destination_reviews" ("destination_id")
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_destination_reviews_destination_id'
        ) THEN
          ALTER TABLE "destination_reviews"
          ADD CONSTRAINT "FK_destination_reviews_destination_id"
          FOREIGN KEY ("destination_id")
          REFERENCES "destinations"("id")
          ON DELETE CASCADE
          ON UPDATE NO ACTION;
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_destination_reviews_user_id'
        ) THEN
          ALTER TABLE "destination_reviews"
          ADD CONSTRAINT "FK_destination_reviews_user_id"
          FOREIGN KEY ("user_id")
          REFERENCES "users"("id")
          ON DELETE SET NULL
          ON UPDATE NO ACTION;
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "destination_reviews" DROP CONSTRAINT IF EXISTS "FK_destination_reviews_user_id"`);
    await queryRunner.query(`ALTER TABLE "destination_reviews" DROP CONSTRAINT IF EXISTS "FK_destination_reviews_destination_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_destination_reviews_destination_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "destination_reviews"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "contact_submissions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "newsletter_subscribers"`);
  }
}
