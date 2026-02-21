// import { DevOpsTeamsProps, DevOpsTeamsResponse } from "../company/[company]/dashboard/components/IntegrationBodys/DevOpsPreBody";

import { DevOpsArea, DevOpsIteration, DevOpsIterationResponds, DevOpsTeamsProps } from "../../(app)/[company]/dashboard/components/IntegrationBodys/DevOps/DevOpsPreBody";
import { Assignee } from "../../types/OpenAI";

export interface DevOpsProjectsProps {
  id: string;
  name: string;
}

export interface DevOpsTeamsResponse {
  count: number;
  value: DevOpsTeamsProps[];
}

export interface DevOpsProjectsReturnProps {
  count: number;
  value: DevOpsProjectsProps[];
}
export interface DevOpsProjectsProps {
  id: string;
  name: string;
}
export interface DevOpsSprintReturnProps {
  count: number;
  value: DevOpsSprintProps[];
}
export interface DevOpsSprintProps {
  id: string;
  name: string;
}
export interface DevOpsAllTeamMembersResponse {
  count: number,
  value: Assignee[]
}


// const pat = process.env.NEXT_PUBLIC_AZURE_DEVOPS_PAT!; 
const pat = process.env.NEXT_PUBLIC_AZURE_DEVOPS_PAT!


//Korrekte metoder:

const FetchDevOpsProjects = async (): Promise<DevOpsProjectsProps[]> => {
  const res = await fetch("/api/integrations/azure-devops/projects", {
    method: "GET",
    headers: {
      "content-type": "application/json"
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  console.log("Dette er projekterne: ");
  console.log(res);
  const data = (await res.json()) as DevOpsProjectsReturnProps;
  return data.value;
};


const FetchAllTeamsByProjectID = async (projectID: string) => {
  const res = await fetch(`/api/integrations/azure-devops/projects/${projectID}/teams`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as DevOpsTeamsResponse;
  return data.value;
};

// const FetchDevOpsProjects = async (): Promise<DevOpsProjectsProps[]> => {
//   try {
//     const encodedPat = btoa(`:${pat}`);
//     const response = await fetch(
//       "https://dev.azure.com/noteTester/_apis/projects?api-version=7.2-preview.1",
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Basic ${encodedPat}`,
//         },
//       }
//     );
//     if (!response.ok) {
//       throw new Error(`HTTP ${response.status}`);
//     }

//     const data = await response.json() as DevOpsProjectsReturnProps;

//     return data.value;
//   } catch (error) {
//     console.error("Error fetching projects:", error);
//     throw error;
//   }
// };

// const FetchAllTeamsByProjectID = async (projectID: string): Promise<DevOpsTeamsProps[]> => {
//   try {
//     const encodedPat = btoa(`:${pat}`);

//     const response = await fetch(
//       `https://dev.azure.com/noteTester/_apis/projects/${projectID}/teams?api-version=7.2-preview.3`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Basic ${encodedPat}`,
//         },
//       }
//     );

//     if (!response.ok) {
//       throw new Error(`HTTP ${response.status}`);
//     }

//     const data = (await response.json()) as DevOpsTeamsResponse;
//     return data.value;
//   } catch (error) {
//     console.error("Error fetching teams:", error);
//     return [];
//   }
// };




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

const FetchAllTeams = async (): Promise<DevOpsTeamsProps[]> => {
  try {
    const encodedPat = btoa(`:${pat}`);

    const response = await fetch(
      `https://dev.azure.com/noteTester/_apis/teams?api-version=7.2-preview.3`,
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

const FetchAllTeamMembersByProjectID = async (projectID: string): Promise<Assignee[]> => {
  try {
    const encodedPat = btoa(`:${pat}`);

    const response = await fetch("https://dev.azure.com/noteTester/_apis/projects/cc935a5f-5866-4557-aa8b-fa3d8c1e3469/teams/22dc1811-4bf9-4995-8d39-a8ff658a4539/members?api-version=7.2-preview.2", {
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

    const data = (await response.json()) as DevOpsAllTeamMembersResponse;
    console.log("All team members:");
    console.log(data);
    return data.value;
  } catch (error) {
    console.log("Error fetching All team members by project id" + error);
    return []
  }

}
const FetchAllAreasProjectID = async (projectID: string): Promise<DevOpsArea | null> => {
  try {
    const encodedPat = btoa(`:${pat}`);

    const response = await fetch(`https://dev.azure.com/noteTester/${projectID}/_apis/wit/classificationnodes/areas?$depth=20&api-version=7.1-preview.2`, {
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

    const data = (await response.json()) as DevOpsArea;
    console.log("All Areas:");
    console.log(data);
    return data;
  } catch (error) {
    console.log("Error fetching All team members by project id" + error);
    return null
  }

}
const FetchAllIterationsByProjectID = async (projectID: string): Promise<DevOpsIteration[]> => {
  try {
    const encodedPat = btoa(`:${pat}`);

    const response = await fetch(`https://dev.azure.com/noteTester/${projectID}/_apis/work/teamsettings/iterations?api-version=7.0`, {
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

    const data = (await response.json()) as DevOpsIterationResponds;
    console.log("All Areas:");
    console.log(data);
    return data.value;
  } catch (error) {
    console.log("Error fetching All team members by project id" + error);
    return []
  }

}
const FethService = {
  FetchAllTeamsByProjectID,
  FetchSprintsByTeam: FetchDevOpsSprintsByTeam,
  FetchProjects: FetchDevOpsProjects,
  FetchAllTeams,
  FetchAllTeamMembersByProjectID,
  FetchAllAreasProjectID,
  FetchAllIterationsByProjectID
}
export default FethService;