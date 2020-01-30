import * as React from "react";
import * as AWS from "aws-sdk";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

type ConfigFunction = (...args: any[]) => AWS.Config;

interface EnvironmentModel {
  name: string;
  configFunction: ConfigFunction;
  args?: any[];
}

export interface DashboardProps {
  children: (
    name: string,
    config: AWS.Config
  ) => React.ReactNode | React.ReactNode[];
  environments: EnvironmentModel[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  children,
  environments
}) => {
  return (
    <Tabs>
      <TabList>
        {environments.map((env: EnvironmentModel) => (
          <Tab>{env.name}</Tab>
        ))}
      </TabList>
      {environments.map((env: EnvironmentModel) => (
        <TabPanel>{children(env.name, env.configFunction(env.args))}</TabPanel>
      ))}
    </Tabs>
  );
};
export default Dashboard;
