import React, { useState } from 'react';
import SavedPaymentMethods from './SavedPaymentMethods';
import AddPaymentMethodForm from './AddPaymentMethodForm';

const PaymentMethodsSection = () => {
  const [refresh, setRefresh] = useState(false);

  return (
    <div>
      <SavedPaymentMethods refresh={refresh} />
      <AddPaymentMethodForm onSuccess={() => setRefresh((r) => !r)} />
    </div>
  );
};

export default PaymentMethodsSection; 