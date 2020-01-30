# react-aws-dashboard

A React componenet which provides tabs to easily switch between AWS environments. This is completely client side and requires no backend to function.

This componenet requires a single property, a list of environments. Each environment has a name attribute and a configFunction, which is a function that returns an [AWS.Config](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html) object.

## Installation

```bash
yarn add react-aws-dashboard
```

## Example (with create-react-app)

1. Create new react app and add react-aws-dashboard

```bash
yarn create react-app my-app --template typescript
cd my-app
yarn add react-aws-dashboard aws-sdk
```

2. Replace src/App.tsx with the following code importing the react-aws-dashboard component.

```typescript
import React, { useEffect, useState } from "react";
import AWS from "aws-sdk";
import Dashboard from "react-aws-dashboard";

interface StsProps {
  config: AWS.Config;
}

const Sts: React.FC<StsProps> = ({ config }) => {
  const [identity, setIdentity] = useState<object | undefined>(undefined);

  useEffect(() => {
    const getIdentity = async () => {
      const client = new AWS.STS(config);
      client
        .getCallerIdentity()
        .promise()
        .then(data => setIdentity(data))
        .catch(err => setIdentity(err));
    };
    getIdentity();
  }, [config]);
  return identity ? <p>{JSON.stringify(identity)}</p> : <></>;
};

const myCredentialsGetter = () => {
  const config = new AWS.Config();
  config.accessKeyId = "AKIAIOSFODNN7EXAMPLE";
  config.secretAccessKey = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
  config.region = "ap-southeast-2";
  return config;
};

const environments = [
  { name: "Example", configFunction: myCredentialsGetter },
  { name: "Example 2", configFunction: myCredentialsGetter }
];

const App: React.FC = () => {
  return (
    <Dashboard environments={environments}>
      {(name: string, config: AWS.Config) => (
        <>
          <Sts config={config} />
        </>
      )}
    </Dashboard>
  );
};

export default App;
```

## Screenshot

![Screenshot](https://raw.githubusercontent.com/assignar/react-aws-dashboard/master/images/screenshot.png?token=AJ2OJHXC4EBHF2TUH7FJ7IC6HO33K)

## Complex Example (Using AWS Cognito User Pools and Federation)

To run this demo you need to do the following...

1. Create a Cognito User Pool with a domain and an application client.
2. Cognito Identity Pool, with Federation set up with the Cognito User Pool.
3. Supply the following variables: AWS_REGION, USER_POOL_ID, USER_POOL_WEB_CLIENT_ID, USER_POOL_DOMAIN, IDENTITY_POOL_ID_1, IDENTITY_POOL_ID_2 and MY_PROVIDER. 

Note: If you only want one identity pool then you can delete the second configFunction `mySecondFederatedIdentity`

```typescript
import React, { useEffect, useState } from "react";
import AWS from "aws-sdk";
import { Auth } from "aws-amplify";
import Dashboard from "react-aws-dashboard";
import Environment from "react-aws-dashboard-codepipeline";

Auth.configure({
  region: AWS_REGION,
  userPoolId: USER_POOL_ID,
  userPoolWebClientId: USER_POOL_WEB_CLIENT_ID,
  mandatorySignIn: true,
  oauth: {
    domain: USER_POOL_DOMAIN,
    scope: ["openid", "email", "profile"],
    redirectSignIn: window.location.origin,
    redirectSignOut: window.location.origin,
    responseType: "code"
  }
});

const myFederatedIdentity = (jwt: string) => {
  const config = new AWS.Config();
  config.region = "ap-southeast-2";

  const credentials = new AWS.CognitoIdentityCredentials(
    {
      IdentityPoolId: IDENTITY_POOL_ID_1,
      Logins: {
        "cognito-idp.AWS_REGION.amazonaws.com/USER_POOL_ID": jwt
      }
    },
    { region: AWS_REGION }
  );
  config.credentials = credentials;
  return config;
};

const mySecondFederatedIdentity = (jwt: string) => {
  const config = new AWS.Config();
  config.region = AWS_REGION;

  const credentials = new AWS.CognitoIdentityCredentials(
    {
      IdentityPoolId: IDENTITY_POOL_ID_2,
      Logins: {
        "cognito-idp.AWS_REGION.amazonaws.com/USER_POOL_ID": jwt
      }
    },
    { region: AWS_REGION }
  );
  config.credentials = credentials;
  return config;
};

const environments = [
  { name: "Account A", configFunction: myFederatedIdentity },
  { name: "Account B", configFunction: mySecondFederatedIdentity }
];

const App: React.FC = () => {
  const [jwt, setJwt] = useState<string | undefined>(undefined);

  useEffect(() => {
    Auth.currentSession()
      .then(session => {
        setJwt(session.getIdToken().getJwtToken());
      })
      .catch(err => {
        console.log(err);
        Auth.federatedSignIn({ customProvider: MY_PROVIDER });
      });
  });

  return jwt ? (
    <Dashboard environments={environments.map(env => ({ ...env, args: jwt }))}>
      {(name: string, config: AWS.Config) => (
        <Environment name={name} config={config} />
      )}
    </Dashboard>
  ) : (
    <></>
  );
};

export default App;
```
