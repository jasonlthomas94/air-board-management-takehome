import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1759670814816 implements MigrationInterface {
    name = 'InitialMigration1759670814816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "board" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "parentId" integer, CONSTRAINT "PK_865a0f2e22c140d261b1df80eb1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "board" ADD CONSTRAINT "FK_de1ba2d72858f8e8ef1708ec97c" FOREIGN KEY ("parentId") REFERENCES "board"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "board" DROP CONSTRAINT "FK_de1ba2d72858f8e8ef1708ec97c"`);
        await queryRunner.query(`DROP TABLE "board"`);
    }

}
