BEGIN TRY

BEGIN TRAN;

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

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000),
    [email] NVARCHAR(1000),
    [passwordHash] NVARCHAR(max),
    [emailVerified] DATETIME2,
    [image] NVARCHAR(1000),
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Account] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [provider] NVARCHAR(1000) NOT NULL,
    [providerAccountId] NVARCHAR(1000) NOT NULL,
    [refresh_token] NVARCHAR(max),
    [access_token] NVARCHAR(max),
    [id_token] NVARCHAR(max),
    [expires_at] INT,
    [token_type] NVARCHAR(1000),
    [scope] NVARCHAR(max),
    [session_state] NVARCHAR(1000),
    [expires_in] INT,
    [ext_expires_in] INT,
    CONSTRAINT [Account_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Account_provider_providerAccountId_key] UNIQUE NONCLUSTERED ([provider],[providerAccountId])
);

-- CreateTable
CREATE TABLE [dbo].[Session] (
    [id] NVARCHAR(1000) NOT NULL,
    [sessionToken] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [expires] DATETIME2 NOT NULL,
    CONSTRAINT [Session_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Session_sessionToken_key] UNIQUE NONCLUSTERED ([sessionToken])
);

-- CreateTable
CREATE TABLE [dbo].[VerificationToken] (
    [id] NVARCHAR(1000) NOT NULL,
    [identifier] NVARCHAR(1000) NOT NULL,
    [token] NVARCHAR(1000) NOT NULL,
    [expires] DATETIME2 NOT NULL,
    CONSTRAINT [VerificationToken_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [VerificationToken_token_key] UNIQUE NONCLUSTERED ([token]),
    CONSTRAINT [VerificationToken_identifier_token_key] UNIQUE NONCLUSTERED ([identifier],[token])
);

-- CreateTable
CREATE TABLE [dbo].[AzureDevopsConfig] (
    [id] NVARCHAR(1000) NOT NULL,
    [connectionId] NVARCHAR(1000) NOT NULL,
    [defaultOrganization] NVARCHAR(1000) NOT NULL CONSTRAINT [AzureDevopsConfig_defaultOrganization_df] DEFAULT '',
    [defaultProject] NVARCHAR(1000) NOT NULL CONSTRAINT [AzureDevopsConfig_defaultProject_df] DEFAULT '',
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [AzureDevopsConfig_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AzureDevopsConfig_connectionId_key] UNIQUE NONCLUSTERED ([connectionId])
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

-- AddForeignKey
ALTER TABLE [dbo].[Account] ADD CONSTRAINT [Account_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Session] ADD CONSTRAINT [Session_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AzureDevopsConfig] ADD CONSTRAINT [AzureDevopsConfig_connectionId_fkey] FOREIGN KEY ([connectionId]) REFERENCES [dbo].[IntegrationConnection]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
