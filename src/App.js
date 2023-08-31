import { useEffect, useState } from 'react'; // Import the necessary dependencies
import { Amplify, Auth } from 'aws-amplify'; // Import Amplify components
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';

Amplify.configure({
  Auth: {
    // (required) only for Federated Authentication - Amazon Cognito Identity Pool ID
    identityPoolId: 'us-west-2:5f5a6b06-3499-4822-bc08-4416fb55dd64',

    // (required)- Amazon Cognito Regionamplify 
    region: 'us-west-2',

    // // (optional) - Amazon Cognito Federated Identity Pool Region
    // // Required only if it's different from Amazon Cognito Region
    // identityPoolRegion: 'XX-XXXX-X',

    // (optional) - Amazon Cognito User Pool ID
    userPoolId: 'us-west-2_QIK1IZFdh',

    // (optional) - Amazon Cognito Web Client ID (26-char alphanumeric string, App client secret needs to be disabled)
    userPoolWebClientId: 's3n7aqptqag0rrh7k1epf9msb',

    // // (optional) - Enforce user authentication prior to accessing AWS resources or not
    // mandatorySignIn: false,

    // (optional) - Configuration for cookie storage
    // Note: if the secure flag is set to true, then the cookie transmission requires a secure protocol
    // cookieStorage: {
    //   // - Cookie domain (only required if cookieStorage is provided)
    //   domain: '.yourdomain.com',
    //   // (optional) - Cookie path
    //   path: '/',
    //   // (optional) - Cookie expiration in days
    //   expires: 365,
    //   // (optional) - See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
    //   sameSite: 'strict' | 'lax',
    //   // (optional) - Cookie secure flag
    //   // Either true or false, indicating if the cookie transmission requires a secure protocol (https).
    //   secure: true
    // },
    // SIGN ON URL = https://tea-mimic.auth.us-west-2.amazoncognito.com/authorize?client_id=s3n7aqptqag0rrh7k1epf9msb&response_type=code&scope=email+openid&redirect_uri=https%3A%2F%2Fexample.com&identity_provider=azure-tea-mimic

    // // (optional) - customized storage object
    // storage: MyStorage,

    // // (optional) - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
    // authenticationFlowType: 'USER_PASSWORD_AUTH',

    // // (optional) - Manually set key value pairs that can be passed to Cognito Lambda Triggers
    // clientMetadata: { myCustomKey: 'myCustomValue' },

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
      responseType: 'token' // or 'token', note that REFRESH token will only be generated when the responseType is code
    }
  }
});



function App() {
  const [user, setUser] = useState(null); // State to hold user data
  const [loading, setLoading] = useState(true); // State to track loading state

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(userData => setUser(userData)) // Set user data if authenticated
      .catch(() => setUser(null))
      .finally(() => setLoading(false)); // Set loading state when done fetching
  }, []);

  return (
    <div className="App">
      <h1>Tea Mimic</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {user ? ( // If user is authenticated, show user info and sign out button
            <div>
              <p>Welcome, {user.attributes.email}</p>
              <button onClick={() => Auth.signOut()}>Sign Out</button>
            </div>
          ) : ( // If user is not authenticated, show sign in button
            <button onClick={() => Auth.federatedSignIn({ customProvider: "azure-tea-mimic" })}>Sign In</button>
          )}
        </>
      )}
    </div>
  );
}

export default App; // Export the App component
