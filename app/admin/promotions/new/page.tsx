import PromotionForm from '@/components/PromotionForm';
import ProtectedRoute from '@/components/admin/protected-route';
import AdminLayout from '@/components/admin/admin-layout';

export default function NewPromotionPage() {
  return (
    <ProtectedRoute resource="promotions" action="create">
      <AdminLayout>
        <PromotionForm mode="create" />
      </AdminLayout>
    </ProtectedRoute>
  );
}
