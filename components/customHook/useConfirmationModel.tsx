// hooks/useConfirmationModal.tsx
import { useState, useCallback } from 'react';
import ShopChangeConfirmationModal from '@/components/ShopChangeConfirmationModal';

export const useConfirmationModal = () => {
  const [visible, setVisible] = useState(false);
  const [resolver, setResolver] = useState<(value: boolean) => void>(() => {});

  const showConfirmation = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      setVisible(true);
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setVisible(false);
    resolver(true);
  };

  const handleCancel = () => {
    setVisible(false);
    resolver(false);
  };

  const ConfirmationModal = (
    <ShopChangeConfirmationModal
      visible={visible}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { showConfirmation, ConfirmationModal };
};
