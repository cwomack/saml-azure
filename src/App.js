import { useEffect, useState } from 'react'; // Import the necessary dependencies
import { Amplify, Auth } from 'aws-amplify'; // Import Amplify components
import { StorageManager } from '@aws-amplify/ui-react-storage';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';

// FINAL working configuration (in v5) test

Amplify.configure({...awsExports,
  Auth: {
    // (required) only for Federated Authentication - Amazon Cognito Identity Pool ID
    identityPoolId: 'us-west-2:5f5a6b06-3499-4822-bc08-4416fb55dd64',
    // identityPoolId: 'us-west-2:178e63e6-61d8-4a48-a91e-1ff0f06e5118',

    // (required)- Amazon Cognito Regionamplify 
    region: 'us-west-2',

    // (optional) - Amazon Cognito User Pool ID
    userPoolId: 'us-west-2_QIK1IZFdh',

    // (optional) - Amazon Cognito Web Client ID (26-char alphanumeric string, App client secret needs to be disabled)
    userPoolWebClientId: 's3n7aqptqag0rrh7k1epf9msb',

    // SIGN ON URL = https://tea-mimic.auth.us-west-2.amazoncognito.com/authorize?client_id=s3n7aqptqag0rrh7k1epf9msb&response_type=code&scope=email+openid&redirect_uri=https%3A%2F%2Fexample.com&identity_provider=azure-tea-mimic

    // (optional) - Hosted UI configuration
    oauth: {
      domain: 'tea-mimic.auth.us-west-2.amazoncognito.com',
      scope: [
        // 'phone',
        'email',
        // 'profile',
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


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [pathTest, setCognitoId] = useState(''); // sub test
  const [pathTest, setPathTest] = useState(''); // Path test

  useEffect(() => {
    Auth.currentAuthenticatedUser()
    .then(userData => {
      setUser(userData);
      // Set the pathTest when user data is available
      setPathTest(userData.attributes.email); // Assuming email is the desired path
    })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
      console.log(user);
      console.log(pathTest);
      console.log(typeof(pathTest));
  }, []);

  return (
    <div className="App">
      <h1>Tea Mimic</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {user ? (
            <div>
              <p>Welcome, {user.attributes.email}</p>
              <button onClick={() => Auth.signOut()}>Sign Out</button>
              {/* Pass pathTest to the path prop */}
              <StorageManager
                acceptedFileTypes={['.png']}
                accessLevel="public" // DO NOT MESS WITH THIS, defaults to public folder if you do. 
                // path={pathTest}
                
                // path={`/test/${pathTest}/`} // Yields: public/ > / > test/ > email > FileName
                // path={`test/${pathTest}/`} // Yields: public/ > test/ > email > FileName
                path={`VendorA/District1/${pathTest}/`} //

              />
            </div>
          ) : (
            <button onClick={() => Auth.federatedSignIn({ customProvider: "azure-tea-mimic" })}>Sign In</button>
          )}
        </>
      )}
    </div>
  );
}

export default App;