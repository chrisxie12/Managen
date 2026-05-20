import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Wallet } from "lucide-react";
import { toast } from "sonner";
import { api } from "../services/api";

const NAVY = "#0A2472";
const MUTED = "#6B7280";

export function PaymentVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const reference = searchParams.get("reference");
    const trxref = searchParams.get("trxref");

    if (!reference && !trxref) {
      setStatus("failed");
      setMessage("No payment reference found.");
      toast.error("No payment reference found.");
      return;
    }

    const ref = reference || trxref;

    const verifyPayment = async () => {
      try {
        const res = await api.get<{ success: boolean; data: { status: string; message: string } }>(
          `/api/billing/verify-payment?reference=${ref}`
        );

        if (res.data?.success) {
          setStatus("success");
          setMessage(res.data.data?.message || "Payment verified successfully!");
          toast.success("Payment successful!");
        } else {
          setStatus("failed");
          setMessage(res.data?.data?.message || "Payment could not be verified.");
          toast.error(res.data?.data?.message || "Payment verification failed.");
        }
      } catch (err: any) {
        setStatus("failed");
        setMessage(err.message || "Failed to verify payment.");
        toast.error(err.message || "Failed to verify payment.");
      }
    };

    verifyPayment();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#F8F9FA" }}>
      <div className="w-full max-w-md rounded-2xl p-8 text-center" style={{ background: "white" }}>
        {status === "verifying" && (
          <>
            <Loader2 size={48} className="animate-spin mx-auto mb-4" style={{ color: NAVY }} />
            <h1 className="text-xl font-bold mb-2" style={{ color: NAVY }}>Verifying Payment</h1>
            <p style={{ color: MUTED }}>Please wait while we confirm your payment...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: "#059669" }} />
            <h1 className="text-xl font-bold mb-2" style={{ color: NAVY }}>Payment Successful!</h1>
            <p className="mb-4" style={{ color: MUTED }}>{message}</p>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle size={48} className="mx-auto mb-4" style={{ color: "#DC2626" }} />
            <h1 className="text-xl font-bold mb-2" style={{ color: NAVY }}>Payment Failed</h1>
            <p className="mb-4" style={{ color: MUTED }}>{message}</p>
          </>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate("/dashboard/fees")}
            className="w-full px-4 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 flex items-center justify-center gap-2"
            style={{ background: NAVY }}
          >
            <Wallet size={16} />
            Return to Fee Payment
          </button>
          {status === "failed" && (
            <button
              onClick={() => navigate(-1)}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: "white",
                color: NAVY,
                border: "1px solid rgba(56,25,50,0.15)",
              }}
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
