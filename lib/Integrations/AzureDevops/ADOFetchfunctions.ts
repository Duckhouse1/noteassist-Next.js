import { AzureOrganization, AzureProject, GetWorkItemTypesResponse } from "./Configuration";
import { DevOpsProjectsProps } from "@/app/Services/DevOpsServices/Fetchservice";
import { WorkItemType } from "@/app/api/integrations/azure-devops/WorkItem/GetWorkItemTypesByProject/route";

export interface FetchedADOData {
  Organizations: AzureOrganization[]
  projects: DevOpsProjectsProps[]
//   workItemTypes: WorkItemType[]
}

async function FetchADOData(defaultProjectName?:string): Promise<FetchedADOData> {
    try {
        const res = await fetch("/api/integrations/azure-devops/Organization");
        if (!res.ok) {
            const body = (await res.json().catch(() => ({}))) as { error?: string };
            throw new Error(body?.error ?? `Failed to fetch organizations (${res.status})`);
        }
        const organizations = (await res.json()) as { organizations: AzureOrganization[] };

        const params = new URLSearchParams({ organization: organizations.organizations[0].name });
        try {
            const res2 = await fetch(`/api/integrations/azure-devops/projects?${params}`);
            if (!res.ok) {
                const body = (await res.json().catch(() => ({}))) as { error?: string };
                throw new Error(body?.error ?? `Failed to fetch projects (${res.status})`);
            }
            const projects = await res2.json();
            // try {
            //     console.log("ProjectID: ")
            //     const projectId = projects.value[0].id
            //     console.log(projectId);
            //     const organization = organizations.organizations[0].name
            //     const params2 = new URLSearchParams({ projectId: defaultProjectName ?? projectId, org: organization });
            //     const res3 = await fetch(`/api/integrations/azure-devops/WorkItem/GetWorkItemTypesByProject?${params2}`);
            //     if (!res.ok) {
            //         const body = (await res3.json().catch(() => ({}))) as { error?: string };
            //         throw new Error(body?.error ?? `Failed to fetch work item types (${res.status})`);
            //     }
            //     const WIT = (await res3.json()) as GetWorkItemTypesResponse;
                const FetchedData: FetchedADOData = {
                    Organizations: organizations.organizations,
                    projects: projects.value,
                    // workItemTypes: WIT.types
                }
                return FetchedData
            // } catch (error) {

            //     console.log("Error fetching All Work items " + error);
            //     return { Organizations: [], projects: [], workItemTypes: [] }

            // }
        } catch (error) {
            console.log("Error fetching All Projects: " + error);

            return { Organizations: [], projects: [] }

        }
    } catch (err: unknown) {
        console.log("Error fetching All organizations: " + err);
        return { Organizations: [], projects: [] }
    }
}







const ADOFetchFunctions = {
    FetchADOData
}

export default ADOFetchFunctions