

export interface DevOpsFeatures {
  title: string;
  description: string;
  pbis: DevOpsPBI[];
}
export interface DevOpsPBI {
  title: string;
  description: string;
  tasks: DevOpsTask[];
}

export interface DevOpsTask {
  title: string;
  description: string;
}