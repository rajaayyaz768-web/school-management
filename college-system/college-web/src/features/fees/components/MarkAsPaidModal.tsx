import { useState, useEffect } from 'react';
import { Modal, Input, Button } from '@/components/ui';
import { FeeRecordResponse, MarkAsPaidInput } from '../types/fees.types';
import { useMarkFeeAsPaid } from '../hooks/useFees';

interface Props {
  record: FeeRecordResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MarkAsPaidModal({ record, isOpen, onClose }: Props) {
  const [amountPaid, setAmountPaid] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [discount, setDiscount] = useState('0');

  const mutation = useMarkFeeAsPaid();

  useEffect(() => {
    if (isOpen && record) {
      const remaining = (record.amountDue ?? 0) - (record.amountPaid ?? 0);
      setAmountPaid(remaining.toString());
      setReceiptNumber('');
      setDiscount('0');
    }
  }, [isOpen, record]);

  if (!record) return null;

  const currentPaid = record.amountPaid ?? 0;
  const currentDue = record.amountDue ?? 0;
  
  const parsedPaid = parseFloat(amountPaid) || 0;
  const parsedDiscount = parseFloat(discount) || 0;
  const newBalance = currentDue - currentPaid - parsedPaid - parsedDiscount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;

    const data: MarkAsPaidInput = {
      amountPaid: currentPaid + parsedPaid,
      receiptNumber: receiptNumber,
      discount: (record.discount ?? 0) + parsedDiscount,
    };

    mutation.mutate(
      { id: record.id, data },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mark Fee as Paid" size="md">
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="bg-[var(--surface-alt)] p-4 rounded-lg space-y-2 text-sm text-[var(--text)]">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Student:</span>
            <span className="font-medium">{record.student?.firstName} {record.student?.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Total Due:</span>
            <span>PKR {currentDue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Already Paid:</span>
            <span>PKR {currentPaid.toLocaleString()}</span>
          </div>
        </div>

        <Input
          label="Payment Amount (PKR)"
          type="number"
          min="0"
          value={amountPaid ?? ''}
          onChange={(e) => setAmountPaid(e.target.value)}
          required
        />
        
        <Input
          label="Receipt Number"
          type="text"
          value={receiptNumber ?? ''}
          onChange={(e) => setReceiptNumber(e.target.value)}
          required
        />

        <Input
          label="Discount (Optional, PKR)"
          type="number"
          min="0"
          value={discount ?? ''}
          onChange={(e) => setDiscount(e.target.value)}
        />

        <div className="border-t border-[var(--border)] pt-4 mt-4">
          <div className="flex justify-between items-center bg-[var(--primary)]/5 p-3 rounded-lg">
            <span className="font-medium text-[var(--text)]">Remaining Balance:</span>
            <span className={`font-bold ${newBalance > 0 ? 'text-[var(--primary)]' : 'text-[var(--success)]'}`}>
              PKR {newBalance.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Confirm Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
