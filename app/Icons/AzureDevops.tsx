import AzureDevOpsLogo from "../../public/10261-icon-service-Azure-DevOps.svg"
import Image from "next/image";

export function AzureDevOpsMark() {
  return (
    <Image
      src={AzureDevOpsLogo}
      alt="Azure DevOps"
      width={32}
      height={32}
      priority
    />
  );
}