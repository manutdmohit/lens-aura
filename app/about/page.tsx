import Image from "next/image";
import { Card } from "@/components/ui/card";

interface AboutApiData {
  content: string;
  vision: string;
  values: { title: string; description: string }[];
  commitment: string;
}

async function getAboutData(): Promise<AboutApiData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/about`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch");
  const result = await res.json();
  return result.data;
}

export default async function AboutPage() {
  let data: AboutApiData;
  try {
    data = await getAboutData();
  } catch {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-500 text-lg font-semibold">
          Failed to load About Us content.
        </div>
      </div>
    );
  }

  // Process HTML paragraphs
  const visionHtml = String(data.vision ?? "");
  const pTags = visionHtml.match(/<p>(.*?)<\/p>/g) || [];

  const heading = pTags[0]?.replace(/<\/?p>/g, "").trim() || "About Lens Aura";
  const subtitle =
    pTags[1]?.replace(/<\/?p>/g, "").trim() ||
    "Redefining eyewear with premium quality and accessible luxury";
  const visionBody = pTags.length > 1 ? pTags.slice(1).join("") : visionHtml;

  return (
    <div className="bg-white min-h-screen flex flex-col space-y-12">
      {/* Header */}
      <div
        className="container mx-auto px-4 pt-16 pb-6 text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h1>
        <p className="text-base md:text-xl text-gray-600">{subtitle}</p>
      </div>

      {/* Vision Section */}
      <div
        className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-10 md:gap-16 py-8 md:py-16"
      >
        <div
          className="flex-1 max-w-xl"
        >
          <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
          <div
            className="prose prose-gray text-gray-700 max-w-none"
            dangerouslySetInnerHTML={{ __html: visionBody || "" }}
          />
        </div>

        <div
          className="flex-1 flex justify-center"
        >
          <Image
            src="/images/about-us.jpg"
            alt="Glasses and contact lens case"
            width={400}
            height={320}
            className="rounded-xl shadow-lg object-contain"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
      </div>

      {/* Values Section */}
      <div
        className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 py-12"
      >
        {data.values.map((value, idx) => (
          <div
            key={value.title + idx}
            className="hover:shadow-lg transition-all duration-300"
          >
            <Card className="flex flex-col items-start p-6 h-full">
              <h3 className="font-semibold text-xl mb-2">{value.title}</h3>
              <p className="text-gray-600 text-sm">{value.description}</p>
            </Card>
          </div>
        ))}
      </div>

      {/* Commitment Section */}
      <div
        className="container mx-auto px-4 py-12"
      >
        <Card className="p-8 bg-slate-50 text-center max-w-3xl mx-auto shadow-md">
          <h2 className="text-2xl font-bold mb-4">Our Commitment to Excellence</h2>
          <div
            className="text-gray-700 text-base"
            dangerouslySetInnerHTML={{ __html: data.commitment || "" }}
          />
        </Card>
      </div>
    </div>
  );
}
