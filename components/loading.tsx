'use client';
import { ClipLoader } from 'react-spinners';

const override = {
  display: 'block',
  margin: '100px auto',
};

interface LoadingPageProps {
  loading: boolean;
}

const LoadingPage = ({ loading }: LoadingPageProps) => {
  return (
    <ClipLoader
      color="#3b82f6"
      loading={loading}
      cssOverride={override}
      size={150}
      aria-label="Loading Spinner"
    />
  );
};

export default LoadingPage;
