import { MigrationInterface, QueryRunner } from "typeorm";

export class TelesateUserDefaultTrueSEt1765522026613 implements MigrationInterface {
    name = 'TelesateUserDefaultTrueSEt1765522026613'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`is_telesat_user\` \`is_telesat_user\` tinyint NOT NULL DEFAULT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`is_telesat_user\` \`is_telesat_user\` tinyint NOT NULL DEFAULT '0'`);
    }

}
