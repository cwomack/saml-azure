# Sample Architecture Diagram: 

![Screenshot 2024-10-14 at 11 46 42 AM](https://github.com/user-attachments/assets/db115821-b589-4fb1-a40d-3078dd10e42c)

This app leverages: 

- [Amplify Auth](https://docs.amplify.aws/gen1/react/build-a-backend/auth/set-up-auth/) (Gen 1, but migrated from v5 to v6) to leverage Amazon Cognito to federate through Microsoft Azure Entra ID via OIDC and SAML

- [Amplify UI File Uploader](https://ui.docs.amplify.aws/react/connected-components/storage/fileuploader) Connected Component for integration with S3 to allow for uploading of files (customizations to the prefix path for dynamic naming based on user that is logged in) 
