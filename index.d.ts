import * as React from "react";
import { DashboardProps } from "./src/components/Dashboard";

declare class Dashboard extends React.Component<DashboardProps> {}

declare module "react-aws-dashboard" {}

export default Dashboard;
