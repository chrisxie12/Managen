-- 20260519100000_paystack_webhook_rpc.sql
-- RPC for atomic Paystack payment processing with row-level locking
BEGIN;

CREATE OR REPLACE FUNCTION process_paystack_payment(
  p_school_id UUID,
  p_invoice_id UUID,
  p_student_id UUID,
  p_amount INTEGER,
  p_payment_method VARCHAR(30),
  p_reference VARCHAR(255),
  p_transaction_id VARCHAR(255)
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_invoice invoices%ROWTYPE;
  v_new_paid_amount INTEGER;
  v_new_status VARCHAR(20);
  v_payment_id UUID;
BEGIN
  SELECT * INTO v_invoice FROM invoices WHERE id = p_invoice_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invoice not found');
  END IF;

  IF v_invoice.status = 'paid' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invoice already paid');
  END IF;

  v_payment_id := gen_random_uuid();
  INSERT INTO payments (id, school_id, invoice_id, student_id, amount, payment_method, reference, transaction_id, status)
  VALUES (v_payment_id, p_school_id, p_invoice_id, p_student_id, p_amount, p_payment_method, p_reference, p_transaction_id, 'completed');

  v_new_paid_amount := v_invoice.paid_amount + p_amount;
  v_new_status := CASE WHEN v_new_paid_amount >= v_invoice.total_amount THEN 'paid' ELSE 'issued' END;

  UPDATE invoices SET paid_amount = v_new_paid_amount, status = v_new_status WHERE id = p_invoice_id;

  RETURN jsonb_build_object(
    'success', true,
    'payment_id', v_payment_id,
    'paid_amount', v_new_paid_amount,
    'total_amount', v_invoice.total_amount,
    'status', v_new_status
  );
END;
$$;

COMMIT;
