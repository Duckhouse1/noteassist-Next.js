/*
  Warnings:

  - A unique constraint covering the columns `[userId,provider,providerAccountId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[Account] DROP CONSTRAINT [Account_provider_providerAccountId_key];

-- CreateTable
CREATE TABLE [dbo].[Organization] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Organization_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Organization_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Organization_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[Membership] (
    [id] NVARCHAR(1000) NOT NULL,
    [organizationId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [Membership_role_df] DEFAULT 'member',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Membership_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Membership_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Membership_organizationId_userId_key] UNIQUE NONCLUSTERED ([organizationId],[userId])
);

-- CreateTable
CREATE TABLE [dbo].[Note] (
    [id] NVARCHAR(1000) NOT NULL,
    [organizationId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000),
    [content] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Note_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Note_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[IntegrationConnection] (
    [id] NVARCHAR(1000) NOT NULL,
    [organizationId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [provider] NVARCHAR(1000) NOT NULL,
    [displayName] NVARCHAR(1000),
    [accessToken] NVARCHAR(max),
    [refreshToken] NVARCHAR(max),
    [expiresAt] DATETIME2,
    [scope] NVARCHAR(1000),
    [meta] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [IntegrationConnection_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [IntegrationConnection_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [IntegrationConnection_organizationId_userId_provider_key] UNIQUE NONCLUSTERED ([organizationId],[userId],[provider])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Membership_userId_idx] ON [dbo].[Membership]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Note_organizationId_createdAt_idx] ON [dbo].[Note]([organizationId], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Note_userId_createdAt_idx] ON [dbo].[Note]([userId], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IntegrationConnection_organizationId_provider_idx] ON [dbo].[IntegrationConnection]([organizationId], [provider]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IntegrationConnection_userId_provider_idx] ON [dbo].[IntegrationConnection]([userId], [provider]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Account_userId_idx] ON [dbo].[Account]([userId]);

-- CreateIndex
ALTER TABLE [dbo].[Account] ADD CONSTRAINT [Account_userId_provider_providerAccountId_key] UNIQUE NONCLUSTERED ([userId], [provider], [providerAccountId]);

-- AddForeignKey
ALTER TABLE [dbo].[Membership] ADD CONSTRAINT [Membership_organizationId_fkey] FOREIGN KEY ([organizationId]) REFERENCES [dbo].[Organization]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Membership] ADD CONSTRAINT [Membership_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Note] ADD CONSTRAINT [Note_organizationId_fkey] FOREIGN KEY ([organizationId]) REFERENCES [dbo].[Organization]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Note] ADD CONSTRAINT [Note_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[IntegrationConnection] ADD CONSTRAINT [IntegrationConnection_organizationId_fkey] FOREIGN KEY ([organizationId]) REFERENCES [dbo].[Organization]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[IntegrationConnection] ADD CONSTRAINT [IntegrationConnection_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
