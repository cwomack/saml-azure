// ----------------------------- Imports -----------------------------

import { useEffect, useState } from 'react'; // Import the necessary dependencies
import { Amplify } from 'aws-amplify'; // Import Amplify components
import { Hub } from 'aws-amplify/utils';
import { uploadData } from 'aws-amplify/storage';
import '@aws-amplify/ui-react/styles.css';
import amplifyconfig from './amplifyconfiguration.json';

import {
  getCurrentUser,
  fetchAuthSession,
  signOut,
  signInWithRedirect,
  fetchUserAttributes
  }
  from 'aws-amplify/auth'

// ----------------------------- Config -----------------------------

Amplify.configure({...amplifyconfig,
  Auth: {
    identityPoolId: 'us-west-2:5f5a6b06-3499-4822-bc08-4416fb55dd64',
    region: 'us-west-2',
    userPoolId: 'us-west-2_QIK1IZFdh',
    userPoolWebClientId: 's3n7aqptqag0rrh7k1epf9msb',

    oauth: {
      domain: 'tea-mimic.auth.us-west-2.amazoncognito.com',
      scope: [
        'email',
        'openid',
        'aws.cognito.signin.user.admin'
      ],
      redirectSignIn: 'http://localhost:3000/',
      redirectSignOut: 'http://localhost:3000/',
      clientId: 's3n7aqptqag0rrh7k1epf9msb', // User Pool client Id or Client ID from SAML provider
      responseType: 'code' // 'code' (do not use implicit token flow as it is less secure)
    }
  },
  Storage: {
    AWSS3: {
      bucket: 'samlazuredf0e31194ac548188b25b0059eb825bc', 
      region: 'us-west-2' // (optional) -  Amazon service region
    }
  }
});

// ----------------------------- App Code ------------------------------

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userAttributes, setUserAttributes] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pathTest, setPathTest] = useState('');

  const getAuthenticatedUser = async () => {
    const {
      username,
      signInDetails
    } = await getCurrentUser();
  
    const {
      tokens: session
    } = await fetchAuthSession();
  
    return {
      username,
      session,
      authenticationFlowType: signInDetails.authFlowType
    };
  }

  const handleSocialSignIn = () => {
    signInWithRedirect({
      provider: {
        custom: 'azure-tea-mimic'
      }
    });
  }

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      console.log("Selected File: ", event.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    console.log("i am called")
    try {
      const result = await uploadData({
        key: file.name,
        data: file
      }).result;
      console.log("Upload Succeeded: ", result.key);
    } catch (e) {
      console.error("Failed upload: ", e);
    }
  };

  useEffect(() => {
    const config = Amplify.getConfig();
    console.log(config);

    const getAuthenticatedUser = async () => {
      try {
        const user = await getCurrentUser();
        const session = await fetchAuthSession();
        setUser(user);
        setPathTest(user.username);
        setLoading(false);
      } catch (error) {
        console.error('Authentication error:', error);
        setLoading(false);
      }
    };
  
    const listener = (data) => {
      if (data.payload.event === 'signIn' || data.payload.event === 'signInWithRedirect') {
        getAuthenticatedUser();
      }
    };
  
    const unsubscribe = Hub.listen('auth', listener);
  
    getAuthenticatedUser();

    async function handleFetchUserAttributes() {
      try {
        setUserAttributes(await fetchUserAttributes())
      } catch (error) {
        console.log(error);
      }
    }

    handleFetchUserAttributes();
  
    return () => unsubscribe();
  }, []);

  return (
    
<div className="App">
      <h1>AWS Datalake File Uploader - Before Data Validation Tests</h1>
      <h2>Migration from v5 to v6 = Complete</h2>
      <h2>Swapping out of the Storage Manager Connected Component for the v6 Storage API's = Complete</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {user ? (
            <div>
              <p>Welcome, {userAttributes?.email}</p>

        <div>
        <input type="file" onChange={onFileChange} accept='.csv' />
        <button onClick={() => selectedFile && uploadFile(selectedFile)}>
          Upload
        </button>
        </div>
              <p></p>
              <p>Note:</p>
              <p>This pilot program for data submission has passed TEA’s cybersecurity standards. We will reach out if we have not received your submission or if we notice any errors/omissions. Submitted data will be stored in a secure S3 environment and only be accessible to those who have gone through the appropriate server and database access request process. If you notice any omissions or discrepancies with data after submission, please re-submit.</p>
             
              <button onClick={() => signOut()}>Sign Out</button>
            </div>
          ) : (
              <button onClick={() => handleSocialSignIn()}>Sign In</button>
          )}
        </>
      )}
    </div>
  );
}

export default App;