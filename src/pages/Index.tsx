import { QueueDashboard } from '@/components/QueueDashboard';
import { LanguageProvider } from '@/contexts/LanguageContext';

const Index = () => {
  return (
    <LanguageProvider>
      <QueueDashboard />
    </LanguageProvider>
  );
};

export default Index;
