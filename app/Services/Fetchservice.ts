// import { DevOpsTeamsProps, DevOpsTeamsResponse } from "../company/[company]/dashboard/components/IntegrationBodys/DevOpsPreBody";

import { DevOpsTeamsProps } from "../company/[company]/dashboard/components/IntegrationBodys/DevOpsPreBody";

export interface DevOpsProjectsProps {
  id: string;
  name: string;
}



export interface DevOpsTeamsResponse {
  count: number;
  value: DevOpsTeamsProps[];
}

const pat = ""; // do not hardcode
console.log("token " + pat);
const FetchDevOpsProjects = async (): Promise<DevOpsProjectsProps[]> => {
  try {
    const encodedPat = btoa(`:${pat}`);
    const response = await fetch(
      "https://dev.azure.com/noteTester/_apis/projects?api-version=7.2-preview.1",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${encodedPat}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json() as DevOpsProjectsReturnProps;
 
    return data.value;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};



const FetchAllTeamsByProjectID = async (projectID: string): Promise<DevOpsTeamsProps[]> => {
  try {
    const encodedPat = btoa(`:${pat}`);

    const response = await fetch(
      `https://dev.azure.com/noteTester/_apis/projects/${projectID}/teams?api-version=7.2-preview.3`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${encodedPat}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as DevOpsTeamsResponse;
    return data.value;
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
};

export interface DevOpsSprintReturnProps {
  count: number;
  value: DevOpsSprintProps[];
}
export interface DevOpsSprintProps {
  id: string;
  name: string;
}


const FetchDevOpsSprintsByTeam = async (teamId: string): Promise<DevOpsSprintProps[]> => {
  try {
    const encodedPat = btoa(`:${pat}`);
    const response = await fetch(
      `https://dev.azure.com/noteTester/NoteAssistTest/${teamId}/_apis/work/teamsettings/iterations?api-version=7.2-preview.1`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${encodedPat}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json() as DevOpsSprintReturnProps;
    return data.value;
  } catch (error) {
    console.error("Error fetching sprints:", error);
    return [];
  }
};

export interface DevOpsProjectsReturnProps {
  count: number;
  value: DevOpsProjectsProps[];
}
export interface DevOpsProjectsProps {
  id: string;
  name: string;
}


const FethService = {
  FetchAllTeamsByProjectID,
  FetchSprintsByTeam: FetchDevOpsSprintsByTeam,
  FetchProjects: FetchDevOpsProjects,
}
export default FethService;