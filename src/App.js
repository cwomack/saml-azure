import { useEffect, useState } from 'react'; // Import the necessary dependencies
import { Amplify, Auth } from 'aws-amplify'; // Import Amplify components
import { FileUploader } from '@aws-amplify/ui-react'; 
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';

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
      responseType: 'code' // 'code' or 'token', note that REFRESH token will only be generated when the responseType is code
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

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(userData => setUser(userData))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
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
              {/* Replace the previous button with the FileUploader component */}
              <FileUploader
                acceptedFileTypes={['.png']}
                accessLevel="public"
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