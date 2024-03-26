// import { useEffect, useState } from 'react'; // Import the necessary dependencies
// import { Amplify, Auth } from 'aws-amplify'; // Import Amplify components
// import { StorageManager } from '@aws-amplify/ui-react-storage';
// import '@aws-amplify/ui-react/styles.css';
// import awsExports from './aws-exports';

// // FINAL working configuration (in v5) test
// // still working on v5 - 03/10/2022

// Amplify.configure({...awsExports,
//   Auth: {
//     // (required) only for Federated Authentication - Amazon Cognito Identity Pool ID
//     identityPoolId: 'us-west-2:5f5a6b06-3499-4822-bc08-4416fb55dd64',
//     // identityPoolId: 'us-west-2:178e63e6-61d8-4a48-a91e-1ff0f06e5118',

//     // (required)- Amazon Cognito Regionamplify 
//     region: 'us-west-2',

//     // (optional) - Amazon Cognito User Pool ID
//     userPoolId: 'us-west-2_QIK1IZFdh',

//     // (optional) - Amazon Cognito Web Client ID (26-char alphanumeric string, App client secret needs to be disabled)
//     userPoolWebClientId: 's3n7aqptqag0rrh7k1epf9msb',

//     // SIGN ON URL = https://tea-mimic.auth.us-west-2.amazoncognito.com/authorize?client_id=s3n7aqptqag0rrh7k1epf9msb&response_type=code&scope=email+openid&redirect_uri=https%3A%2F%2Fexample.com&identity_provider=azure-tea-mimic

//     // (optional) - Hosted UI configuration
//     oauth: {
//       domain: 'tea-mimic.auth.us-west-2.amazoncognito.com',
//       scope: [
//         // 'phone',
//         'email',
//         // 'profile',
//         'openid',
//         'aws.cognito.signin.user.admin'
//       ],
//       redirectSignIn: 'http://localhost:3000/',
//       redirectSignOut: 'http://localhost:3000/',
//       clientId: 's3n7aqptqag0rrh7k1epf9msb', // User Pool client Id or Client ID from SAML provider
//       responseType: 'code' // 'code' (do not use implicit token flow as it is less secure)
//     }
//   },
//   Storage: {
//     AWSS3: {
//       bucket: 'samlazuredf0e31194ac548188b25b0059eb825bc', // (required) -  Amazon S3 bucket name
//       region: 'us-west-2' // (optional) -  Amazon service region
//     }
//   }
// });


// function App() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   // const [pathTest, setCognitoId] = useState(''); // sub test
//   const [pathTest, setPathTest] = useState(''); // Path test

//   useEffect(() => {
//     Auth.currentAuthenticatedUser()
//     .then(userData => {
//       setUser(userData);
//       // Set the pathTest when user data is available
//       setPathTest(userData.attributes.email); // Assuming email is the desired path
//     })
//       .catch(() => setUser(null))
//       .finally(() => setLoading(false));
//       console.log(user);
//       console.log(pathTest);
//       console.log(typeof(pathTest));
//   }, []);

//   return (
//     <div className="App">
//       <h1>SAML Federation via Azure/Entra ID - v5</h1>
//       {loading ? (
//         <p>Loading...</p>
//       ) : (
//         <>
//           {user ? (
//             <div>
//               <p>Welcome, {user.attributes.email}</p>
//               <button onClick={() => Auth.signOut()}>Sign Out</button>
//               {/* Pass pathTest to the path prop */}
//               <StorageManager
//                 acceptedFileTypes={['.png']}
//                 accessLevel="public" // DO NOT MESS WITH THIS, defaults to public folder if you do. 
//                 // path={pathTest}
                
//                 // path={`/test/${pathTest}/`} // Yields: public/ > / > test/ > email > FileName
//                 // path={`test/${pathTest}/`} // Yields: public/ > test/ > email > FileName
//                 path={`VendorA/District1/${pathTest}/`} //

//               />
//             </div>
//           ) : (
//             <button onClick={() => Auth.federatedSignIn({ customProvider: "azure-tea-mimic" })}>Sign In</button>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

// export default App;

// ----------------------------- Start of TEA migation code -----------------------------

// ----------------------------- Imports -----------------------------


import { useEffect, useState } from 'react'; // Import the necessary dependencies
import { Amplify } from 'aws-amplify'; // Import Amplify components
import { Hub } from 'aws-amplify/utils';
import { StorageManager } from '@aws-amplify/ui-react-storage';
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
      bucket: 'samlazuredf0e31194ac548188b25b0059eb825bc', // (required) -  Amazon S3 bucket name
      region: 'us-west-2' // (optional) -  Amazon service region
    }
  }
});

// ----------------------------- App Code ------------------------------


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userAttributes, setUserAttributes] = useState(null);
  // const [pathTest, setCognitoId] = useState(''); // sub test
  const [pathTest, setPathTest] = useState(''); // Path test

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
    };
  }

  const handleSocialSignIn = () => {
    signInWithRedirect({
      provider: {
        custom: 'azure-tea-mimic'
      }
    });
  }

  useEffect(() => {
    const config = Amplify.getConfig();
    console.log(config);

    const getAuthenticatedUser = async () => {
      try {
        const user = await getCurrentUser();
        const session = await fetchAuthSession();
        setUser(user);
        setPathTest(user.username); // Adjust according to your data structure
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
  
    getAuthenticatedUser(); // Initial check for the user's sign-in status

    async function handleFetchUserAttributes() {
      try {
        setUserAttributes(await fetchUserAttributes())
      } catch (error) {
        console.log(error);
      }
    }

    handleFetchUserAttributes();
  
    return () => unsubscribe(); // Unsubscribe when component unmounts
  }, []);

  return (
<div className="App">
      <h1>AWS Datalake File Uploader</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {user ? (
            <div>
              <p>Welcome, {userAttributes?.email}</p>
 
              <StorageManager
                acceptedFileTypes={['.jpg']}
                accessLevel="guest"
                maxFileCount={15}
                isResumable
                />  
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


// ----------------------------- End of TEA migation code --------------------------------