/*
  Warnings:

  - You are about to drop the `AzureDevopsConfig` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[AzureDevopsConfig] DROP CONSTRAINT [AzureDevopsConfig_connectionId_fkey];

-- DropTable
DROP TABLE [dbo].[AzureDevopsConfig];

-- CreateTable
CREATE TABLE [dbo].[UserWorkspaceConfig] (
    [id] NVARCHAR(1000) NOT NULL,
    [organizationId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [schemaVersion] INT NOT NULL CONSTRAINT [UserWorkspaceConfig_schemaVersion_df] DEFAULT 1,
    [data] NVARCHAR(max) NOT NULL,
    [updatedAt] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [UserWorkspaceConfig_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [UserWorkspaceConfig_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UserWorkspaceConfig_organizationId_userId_key] UNIQUE NONCLUSTERED ([organizationId],[userId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [UserWorkspaceConfig_userId_idx] ON [dbo].[UserWorkspaceConfig]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [UserWorkspaceConfig_organizationId_idx] ON [dbo].[UserWorkspaceConfig]([organizationId]);

-- AddForeignKey
ALTER TABLE [dbo].[UserWorkspaceConfig] ADD CONSTRAINT [UserWorkspaceConfig_organizationId_fkey] FOREIGN KEY ([organizationId]) REFERENCES [dbo].[Organization]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserWorkspaceConfig] ADD CONSTRAINT [UserWorkspaceConfig_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
