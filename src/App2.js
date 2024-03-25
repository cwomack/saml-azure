// commit before making the v6 migration for TEA side

import { useEffect, useState } from 'react'; // Import the necessary dependencies
import { Amplify } from 'aws-amplify'; // Import Amplify components
import {
getCurrentUser,
fetchAuthSession,
signOut,
signInWithRedirect
}
from 'aws-amplify/auth'
import '@aws-amplify/ui-react/styles.css';
import TEALogo from "./TEALogo.png"; // Import TEA logo
import { StorageManager } from '@aws-amplify/ui-react-storage';
 
Amplify.configure({
  Auth: {
    // (required) only for Federated Authentication - Amazon Cognito Identity Pool ID
   identityPoolId: 'YOUR_IDENTITY_POOL_ID',
 
    // (required)- Amazon Cognito Regionamplify
    region: 'us-west-2',
 
    // (optional) - Amazon Cognito User Pool ID
    userPoolId: 'YOUR_USER_POOL_ID',
 
    // (optional) - Amazon Cognito Web Client ID (26-char alphanumeric string, App client secret needs to be disabled)
    userPoolWebClientId: 'YOUR WEB CLIENT ID',
 
    oauth: {
      domain: 'example-setup-1.auth.us-east-1.amazoncognito.com',
      scope: [
        // 'phone',
        'email',
        // 'profile',
        'openid',
        'aws.cognito.signin.user.admin'
      ],
      redirectSignIn: 'YOUR_REDIRECT_SIGN_IN_URL',
      redirectSignOut: 'YOUR_REDIRECT_SIGN_OUT_URL',
      clientId: 'YOUR CLIENT ID', // User Pool client Id or Client ID from SAML provider
      responseType: 'token' // or 'token', note that REFRESH token will only be generated when the responseType is code
    }
  },
  Storage: {
    AWSS3: {
      bucket: 'YOUR BUCKET', // (required) -  Amazon S3 bucket name
      region: 'us-east-1' // (optional) -  Amazon service region
      //s3://tea-comm-prd-datalake-s3/confidential_blended_learning_amplify/
    }
  }
});
 
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pathTest, setPathTest] = useState(''); // Path test
  // const [fileSizeError, setFileSizeError] = useState(null);
  // const [fileContent, setFileContent] = useState(null);
  // const [imageSizeKB, setImageSizeKB] = useState(0); // Add this state variable
  // const maxFileSize = 1000000; // 1GB
  // const minFileSize = 1024; // 1KB (you can adjust this as needed)
 
  useEffect() => {
 
  const getAuthenticatedUser = async () => {
  const {
    username,
    signInDetails
  } = await getCurrentUser();
 
  const {
    tokens: session
  } = await fetchAuthSession();
 
  // Note that session will no longer contain refreshToken and clockDrift
  return {
    username,
    session,
    authenticationFlowType: signInDetails.authFlowType
  }
};
const provider = {
  custom: 'azure-ad-test-4'
}
 
function handleSignInClick() {
    signInWithRedirect({provider})
}
  },
getAuthenticatedUser()
    .then(userData => {
      setUser(userData);
      // Set the pathTest when user data is available
      setPathTest(userData.attributes.name); // Assuming email is the desired path
    })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
      console.log(user);
      console.log(pathTest);
  }, [];

 
  return (
    <div className="App">
      <img src={TEALogo} alt="TEAlogo" style={{width: '170px', height:'auto'}}/>
      <h1>AWS Datalake File Uploader</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {user ? (
            <div>
              {/* <img src={TEALogo} alt="TEAlogo" style={{width: '50px', height:'auto'}}/> */}
              <p>Welcome, {user.attributes.email}</p>
 
              {/* Replace the previous button with the FileUploader component */}
              <StorageManager
                acceptedFileTypes={['.csv']}
                maxFileSize={1000000000}
                accessLevel="public"
                maxFileCount={15}
                isResumable
                path={`confidential_blended_learning/${pathTest}/`}
                />  
              <p></p>
              <p>Note:</p>
              <p>This pilot program for data submission has passed TEA’s cybersecurity standards. We will reach out if we have not received your submission or if we notice any errors/omissions. Submitted data will be stored in a secure S3 environment and only be accessible to those who have gone through the appropriate server and database access request process. If you notice any omissions or discrepancies with data after submission, please re-submit.</p>
             
              <button onClick={() => signOut()}>Sign Out</button>
            </div>
          ) : (
              <button onClick={() => handleSignInClick()}>Sign In</button>
          )}
        </>
      )}
    </div>
  );
}
 
export default App2;