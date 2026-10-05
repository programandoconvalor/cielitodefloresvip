
import { getCurrentSiteData } from "@/services/siteRuntime";

export default async function Politicas(){

const siteData = await getCurrentSiteData();

return(

<div className="max-w-4xl mx-auto py-20 px-6">

<h1 className="text-4xl font-bold mb-6">
{siteData.policies.title}
</h1>

{siteData.policies.summaryParagraphs.map((paragraph) => (
<p key={paragraph} className="mb-4">
{paragraph}
</p>
))}

</div>

)

}

