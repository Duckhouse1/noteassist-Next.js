BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[IntegrationConfig] (
    [connectionId] NVARCHAR(1000) NOT NULL,
    [provider] NVARCHAR(1000) NOT NULL,
    [schemaVersion] INT NOT NULL CONSTRAINT [IntegrationConfig_schemaVersion_df] DEFAULT 1,
    [data] NVARCHAR(max) NOT NULL,
    [updatedAt] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [IntegrationConfig_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [IntegrationConfig_pkey] PRIMARY KEY CLUSTERED ([connectionId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IntegrationConfig_provider_idx] ON [dbo].[IntegrationConfig]([provider]);

-- AddForeignKey
ALTER TABLE [dbo].[IntegrationConfig] ADD CONSTRAINT [IntegrationConfig_connectionId_fkey] FOREIGN KEY ([connectionId]) REFERENCES [dbo].[IntegrationConnection]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
