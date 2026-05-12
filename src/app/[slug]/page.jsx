import { GuestLayout } from '@/components/guest/GuestLayout';
import { GuestHomePage } from '@/components/guest/GuestHomePage';

export default async function RootPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  
  if (!slug) {
    return <div>Invalid Company URL</div>;
  }

  return (
    <GuestLayout>
      <GuestHomePage slug={slug} />
    </GuestLayout>
  );
}

