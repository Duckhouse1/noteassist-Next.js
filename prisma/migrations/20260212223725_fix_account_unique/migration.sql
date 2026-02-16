/*
  Warnings:

  - A unique constraint covering the columns `[provider,providerAccountId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[Account] DROP CONSTRAINT [Account_userId_provider_providerAccountId_key];

-- CreateIndex
ALTER TABLE [dbo].[Account] ADD CONSTRAINT [Account_provider_providerAccountId_key] UNIQUE NONCLUSTERED ([provider], [providerAccountId]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
