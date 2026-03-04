import { DevOpsElement } from "@/app/types/OpenAI";
import { ClickUpElements } from "@/lib/Integrations/ClickUp/Configuration";
import { ProviderId } from "@/lib/Integrations/ProviderUserConfigs";


export type Elements = DevOpsElement[] | ClickUpElements[]

export default async function CreateElementsByProviderID(providerID:ProviderId, elements: Elements) {

    try {
        switch(providerID){
            case("azure-devops"):
                await CreateDevOpsWorkItems(elements)
        }
    } catch (error) {
        console.log("Error durring creation of " + providerID + " elements:");
        console.log(error);
    }
}

 async function CreateDevOpsWorkItems(elements:DevOpsElement[]) {
    console.log("Vi opretter dem nu");
}   
