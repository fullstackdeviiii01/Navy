// app/pages/[slug]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import PageContent from "../../components/pages/PageContent";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getPage(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/site-settings/slug/${slug}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.page;
  } catch (error) {
    console.error("Failed to fetch page:", error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: page.meta_title || page.title,
    description: page.meta_description || page.title,
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  return <PageContent page={page} />;
}