import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/firebase-config";
import toast from "react-hot-toast";
import { sendWhatsAppMessage } from "../utils/whatsapp";
import { db } from "../firebase/firebase-config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

interface EscalationInput {
  patientName: string;
  reason: string;
  doctorEmail: string;
  phoneNumber: string;
  severity: "critical" | "high" | "medium" | "low";
  businessId: string;
  alertId?: string;
  escalatedBy: string;
}

export const useEscalation = () => {
  const escalate = async ({
    patientName,
    reason,
    doctorEmail,
    phoneNumber,
    severity,
    businessId,
    alertId,
    escalatedBy,
  }: EscalationInput) => {
    const sendEmail = httpsCallable(functions, "sendEscalationEmail");

    try {
      const emailRes = await sendEmail({ patientName, reason, doctorEmail, severity });
      if ((emailRes.data as any).success) {
        toast.success("Escalation email sent");
      } else {
        toast.error("Email failed to send");
      }

      sendWhatsAppMessage(phoneNumber, `🚨 Patient ${patientName} escalated for: ${reason}`);

      if (alertId) {
        await addDoc(
          collection(db, "businesses", businessId, "criticalAlerts", alertId, "escalationLogs"),
          {
            patientName,
            reason,
            severity,
            notifiedPersons: [doctorEmail, phoneNumber],
            escalatedBy,
            timestamp: serverTimestamp(),
          }
        );
      }
    } catch (err: any) {
      console.error("Escalation failed:", err);
      toast.error("Escalation failed");
    }
  };

  return { escalate };
};
