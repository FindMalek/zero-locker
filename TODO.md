# TODO

This file would contain a list of tasks that need to be completed.
The format would be:

- [ ] Task 1 || Priority
- [ ] Task 2 || Priority
- [ ] Task 3 || Priority

> NOTE: The MVP is going to be released before the integration of oRPC and TanStack Query
> So we can ship fast, and worry less about the DX

## Tasks

- [ ] In the `CredentialMetadata` model changes
      The `additionalInfo` field should be a JSON object, of the user's choice.

- [ ] For the `otherInfo` field in the `Credential` and `Card` models.
      We should create a new model to store the information.
      But for now the `Json` type is good enough.
      Make sure to create a component to enter the key / value pairs.
      TODO: Create a model for this. with encryption.

- [ ] Update Login and Register page
      Make a better UI for the login page
      Make a cool looking register page with a split layout like Supabase

- [ ] Update the landing page to be more responsive
      Also make sure the data of the cards is actually correct

- [ ] Automatic `CardSatuts` detection
      e.g. if the date is due, then automatically its expired

- [ ] Update the `SecretMetadata` model
      We need to have link to `Platform` model.

- [ ] Update the `Secret` dialog
      In each secret we should add a 'Pen' icon to edit more details about that secret

- [ ] Update the `SecretMetadata` model
      We need to have link to `Tags` model.
      Should we really do this ?

- [ ] Secret container must have these actions - [ ] Add a secret - [ ] Edit a secret - [ ] Delete a secret - [ ] View a secret - [ ] Copy a secret - [ ] Share a secret - [ ] Export .env file - [ ] Generate a .env.example file - [ ] Generate a env.ts file for the `t3-env` library

- [ ] In each model that uses CRUD actions, implement `isDeleted`
      This would help in recovery and undo actions

- [ ] Use services instead of `lib` files
      We should create a new folder called `services` and move all the functions that are not related to the database to this folder.

- [ ] Credential, Secrets and Cards sharing
      WE will have an ability to share links or QR code for this
      with a shorten link with dub.co maybe

### Finished Tasks

- [x] Change return types of the Server Actions || High
      Currently we use ZOD.parse() in the server actions to validate the data.
      Which is good, but I would like to use `entity.ts` and `query.ts` to validate the data - Each Prisma model would have a corresponding entity and query.

- [x] Create a `verify` function for the `better-auth` library || High
      This would be used to verify the user session in the server actions. We could use this in the client as well.

- [x] We should change the `Credential`, like `loginUrl` is not neccesary. Because that could be stored in the `Platform` model.

- [x] Finish editing the `DashboardAddCredentialDialog`

- [x] Usage of 'logo.dev' for `Platforms` model

- [x] Create a list Zod Object for these: - [x] `CardProvider` - [x] `CardType` - [x] `CardStatus`

- [x] The `CardPaymentInputs` component changes
      I would like to move this component to `/shared` folder.
      Also if we couldnt recognize the card type, we should make the image a Select component, with the options being the `CardProvider` enum, and the user could either select the provider, or enter a new Card Provider.

- [x] Implement the new `Secret` model from v0.dev
      Link: https://v0.dev/chat/secrets-management-form-kgsnkNa1gw8

- [x] Encyption of values ✅ COMPLETED
      I noticed a lot of use to these `iv`, `encryptionKey`, `VALUE` fields.
      I would like to create a Model to store these values. and use it in the `Credential` and `Card` models, or anything that needs encryption.

        **IMPLEMENTATION COMPLETED:**
        - ✅ Created new `EncryptedData` model in `prisma/schema/encryption.prisma`
        - ✅ Updated `Card` model to use `cvvEncryption` and `numberEncryption` relations
        - ✅ Updated `CardHistory` model to use encrypted data for old/new values
        - ✅ Updated `Credential` model to use `passwordEncryption` relation
        - ✅ Updated `CredentialHistory` model to use encrypted data for old/new password- [x] Refactor all of the database schemas
        We need to refactor the database schemas to be more consistent.

  s - ✅ Updated `Secret` model to use `valueEncryption` relation - ✅ Created new schemas in `schemas/encrypted-data.ts` - ✅ Created new entity in `entities/encrypted-data/` - ✅ Updated all server actions to use the new EncryptedData structure - ✅ Updated all seeders to create encrypted data properly - ✅ Created and applied database migration - ✅ All tests pass - database seeding works correctly

- [x] In the `Credential` model changes
      Change the `username` to `identifier` to make it more clear that it could be anything.

- [x] The `CardHistory` is not being used.
      Please remove it and any use for it.

- [x] Refactor all of the database schemas
      We need to refactor the database schemas to be more consistent.

- [x] Make sure the `seeder` uses `createMany` instead of `create` records

- [x] Update - [x] Update all the DTOs to include `metadata` fields
      We want to have one call to create the data, not multiple calls from the client.t to have one call to create the data, not multiple calls from the client.

- [x] Refactor the `EncryptedData` model
      For each `query.ts` file, that its entity uses the `EncryptedData` model, we should create a new function that gets the `EncryptedData` model, and one dosent
      We should think about it decrypting the data, in the server actions or entity.ts file or in the client.

- [x] usage of `Metadata` aserver actions

- [x] Update dependecies: 1. Update `prisma` 2. Update `pnpm`

- [x] Implement oRPC instead of Next.js Server Actions || Low
      This would let us scale into using API calls for external usage of the app, to be used in other apps.

- [x] Use Tanstack Query for reloading data
