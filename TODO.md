# TODO

This file would contain a list of tasks that need to be completed.
The format would be:

- [ ] Task 1 || Priority
- [ ] Task 2 || Priority
- [ ] Task 3 || Priority

> NOTE: The MVP is going to be released before the integration of oRPC and TanStack Query
> So we can ship fast, and worry less about the DX

## Tasks

- [ ] Implement oRPC instead of Next.js Server Actions || Low
      This would let us scale into using API calls for external usage of the app, to be used in other apps.

- [ ] Use Tanstack Query for reloading data

- [ ] In the `Credential` model changes
      Change the `username` to `identifier` to make it more clear that it could be anything.

- [ ] In the `CredentialMetadata` model changes
      The `additionalInfo` field should be a JSON object, of the user's choice.

- [ ] The `CardHistory` is not being used.
      Please remove it and any use for it.

- [ ] Encyption of values
      I noticed a lot of use to these `iv`, `encryptionKey`, `VALUE` fields.
      I would like to create a Model to store these values. and use it in the `Credential` and `Card` models, or anything that needs encryption.

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
