-- 添加用户管理相关字段
ALTER TABLE "users" ADD COLUMN "membership_level" varchar(20) DEFAULT 'free' NOT NULL;
ALTER TABLE "users" ADD COLUMN "status" varchar(20) DEFAULT 'active' NOT NULL;
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp;

-- 添加索引以提高查询性能
CREATE INDEX "idx_users_status" ON "users" ("status");
CREATE INDEX "idx_users_membership_level" ON "users" ("membership_level");
CREATE INDEX "idx_users_last_login_at" ON "users" ("last_login_at");
