import PromotionForm from '@/components/PromotionForm';
import ProtectedRoute from '@/components/admin/protected-route';
import AdminLayout from '@/components/admin/admin-layout';

interface EditPromotionPageProps {
  params: {
    id: string;
  };
}

export default function EditPromotionPage({ params }: EditPromotionPageProps) {
  return (
    <ProtectedRoute resource="promotions" action="update">
      <AdminLayout>
        <PromotionForm mode="edit" promotionId={params.id} />
      </AdminLayout>
    </ProtectedRoute>
  );
}
