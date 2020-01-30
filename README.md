# react-aws-dashboard

A React componenet which provides tabs to easily switch between AWS environments. This is completely client side and requires no backend to function.

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
  return identity ? <pre>{JSON.stringify(identity)}</pre> : <></>;
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
  { name: "Example 2", configFunction: myCredentialsGetter },
];

const App: React.FC = () => {
  return (
    <Dashboard environments={environments}>
      {(name, config) => (
        <>
          <Sts config={config} />
        </>
      )}
    </Dashboard>
  );
};

export default App;
```
