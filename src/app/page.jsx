import { GuestLayout } from '@/components/guest/GuestLayout';
import { GuestHomePage } from '@/components/guest/GuestHomePage';

export default function RootPage() {
  return (
    <GuestLayout>
      <GuestHomePage />
    </GuestLayout>
  );
}

