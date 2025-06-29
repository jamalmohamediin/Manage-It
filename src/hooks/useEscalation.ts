import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/firebase-config";
import toast from "react-hot-toast";
import { sendWhatsAppMessage } from "../utils/whatsapp";
import { db } from "../firebase/firebase-config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { addNotificationWithDuplicateCheck } from "../firebase/notifications";

interface EscalationInput {
  patientName: string;
  reason: string;
  doctorEmail: string;
  phoneNumber: string;
  severity: "critical" | "high" | "medium" | "low";
  businessId: string;
  alertId?: string;
  escalatedBy: string;
  urgency?: "immediate" | "urgent" | "routine";
  additionalContacts?: string[];
  instructions?: string;
}

interface EscalationResult {
  success: boolean;
  escalationId?: string;
  notificationsSent: number;
  errors?: string[];
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
    urgency = "urgent",
    additionalContacts = [],
    instructions
  }: EscalationInput): Promise<EscalationResult> => {
    
    const errors: string[] = [];
    let notificationsSent = 0;
    let escalationId: string | undefined;

    try {
      // Validate inputs
      if (!patientName || !reason || !escalatedBy) {
        throw new Error("Missing required escalation information");
      }

      const escalationData = {
        patientName,
        reason,
        severity,
        urgency,
        escalatedBy,
        timestamp: serverTimestamp(),
        businessId,
        alertId,
        doctorEmail,
        phoneNumber,
        additionalContacts,
        instructions,
        status: "initiated"
      };

      // Create escalation record
      const escalationRef = await addDoc(
        collection(db, "escalations"),
        escalationData
      );
      escalationId = escalationRef.id;

      // 1. Send email escalation
      if (doctorEmail) {
        try {
          const sendEmail = httpsCallable(functions, "sendEscalationEmail");
          const emailRes = await sendEmail({ 
            patientName, 
            reason, 
            doctorEmail, 
            severity,
            urgency,
            escalatedBy,
            escalationId: escalationRef.id,
            instructions
          });

          if ((emailRes.data as any).success) {
            toast.success(`📧 Escalation email sent to ${doctorEmail}`);
            notificationsSent++;
          } else {
            const error = "Email failed to send";
            errors.push(error);
            toast.error(error);
          }
        } catch (emailError) {
          const error = `Email error: ${emailError}`;
          errors.push(error);
          console.error("Email escalation failed:", emailError);
        }
      }

      // 2. Send WhatsApp escalation
      if (phoneNumber) {
        try {
          const urgencyEmoji = urgency === "immediate" ? "🚨🚨" : urgency === "urgent" ? "🚨" : "⚠️";
          const whatsappMessage = `${urgencyEmoji} PATIENT ESCALATION\n\nPatient: ${patientName}\nReason: ${reason}\nSeverity: ${severity.toUpperCase()}\nEscalated by: ${escalatedBy}\n\n${instructions ? `Instructions: ${instructions}\n\n` : ''}Please respond immediately.`;
          
          await sendWhatsAppMessage(phoneNumber, whatsappMessage);
          toast.success(`📱 WhatsApp sent to ${phoneNumber}`);
          notificationsSent++;
        } catch (whatsappError) {
          const error = `WhatsApp error: ${whatsappError}`;
          errors.push(error);
          console.error("WhatsApp escalation failed:", whatsappError);
        }
      }

      // 3. Send to additional contacts
      for (const contact of additionalContacts) {
        try {
          if (contact.includes('@')) {
            // Email contact
            const sendEmail = httpsCallable(functions, "sendEscalationEmail");
            await sendEmail({ 
              patientName, 
              reason, 
              doctorEmail: contact, 
              severity,
              urgency,
              escalatedBy,
              escalationId: escalationRef.id
            });
            notificationsSent++;
          } else {
            // Phone contact
            const urgencyEmoji = urgency === "immediate" ? "🚨🚨" : "🚨";
            const message = `${urgencyEmoji} ESCALATION: Patient ${patientName} - ${reason}. Severity: ${severity}. Contact: ${escalatedBy}`;
            await sendWhatsAppMessage(contact, message);
            notificationsSent++;
          }
        } catch (contactError) {
          errors.push(`Failed to contact ${contact}: ${contactError}`);
        }
      }

      // 4. Create internal notification for healthcare team
      try {
        await addNotificationWithDuplicateCheck({
          userId: escalatedBy, // Notify the person who escalated
          title: `🚨 Escalation Initiated - ${patientName}`,
          body: `You escalated ${patientName} for: ${reason}. ${notificationsSent} notifications sent.`
        }, {
          metaType: 'escalation-initiated',
          role: 'healthcare-provider',
          priority: severity === 'critical' ? 'critical' : 'high',
          data: {
            escalationId: escalationRef.id,
            patientName,
            reason,
            severity,
            notificationsSent
          }
        });
      } catch (notificationError) {
        console.error("Failed to create escalation notification:", notificationError);
      }

      // 5. Update alert if provided
      if (alertId) {
        try {
          await addDoc(
            collection(db, "businesses", businessId, "criticalAlerts", alertId, "escalationLogs"),
            {
              patientName,
              reason,
              severity,
              urgency,
              notifiedPersons: [doctorEmail, phoneNumber, ...additionalContacts].filter(Boolean),
              escalatedBy,
              escalationId: escalationRef.id,
              timestamp: serverTimestamp(),
              status: "completed",
              notificationsSent,
              errors: errors.length > 0 ? errors : undefined
            }
          );
        } catch (logError) {
          console.error("Failed to log escalation:", logError);
        }
      }

      // Show summary toast
      if (notificationsSent > 0) {
        toast.success(`✅ Escalation completed: ${notificationsSent} notifications sent`);
      } else {
        toast.error("❌ Escalation failed: No notifications sent");
      }

      return {
        success: notificationsSent > 0,
        escalationId,
        notificationsSent,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (err: any) {
      console.error("Escalation failed:", err);
      toast.error(`❌ Escalation failed: ${err.message}`);
      
      return {
        success: false,
        escalationId,
        notificationsSent,
        errors: [err.message, ...errors]
      };
    }
  };

  // Bulk escalation for multiple patients
  const escalateMultiple = async (escalations: EscalationInput[]): Promise<EscalationResult[]> => {
    const results: EscalationResult[] = [];
    
    for (const escalationInput of escalations) {
      const result = await escalate(escalationInput);
      results.push(result);
      
      // Add delay between escalations to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  };

  // Check escalation status
  const getEscalationStatus = async (escalationId: string) => {
    try {
      // Implementation would fetch escalation status from Firestore
      // This is a placeholder for the actual implementation
      console.log("Checking escalation status:", escalationId);
      return { status: "initiated", timestamp: new Date() };
    } catch (error) {
      console.error("Failed to get escalation status:", error);
      throw error;
    }
  };

  // Cancel escalation (if possible)
  const cancelEscalation = async (escalationId: string, reason: string) => {
    try {
      // Implementation would update escalation status to cancelled
      console.log("Cancelling escalation:", escalationId, reason);
      toast("Escalation cancelled");
    } catch (error) {
      console.error("Failed to cancel escalation:", error);
      toast.error("Failed to cancel escalation");
    }
  };

  return { 
    escalate, 
    escalateMultiple, 
    getEscalationStatus, 
    cancelEscalation 
  };
};

// Utility function for pre-filled escalation templates
export const escalationTemplates = {
  criticalVitals: (patientName: string, vitals: string[]) => ({
    reason: `Critical vital signs detected: ${vitals.join(', ')}`,
    severity: "critical" as const,
    urgency: "immediate" as const,
    instructions: "Patient requires immediate assessment and intervention"
  }),
  
  medicationReaction: (patientName: string, medication: string) => ({
    reason: `Adverse reaction to ${medication}`,
    severity: "high" as const,
    urgency: "urgent" as const,
    instructions: "Review medication orders and consider alternatives"
  }),
  
  postOpComplications: (patientName: string, procedure: string) => ({
    reason: `Post-operative complications following ${procedure}`,
    severity: "high" as const,
    urgency: "urgent" as const,
    instructions: "Surgical review required"
  }),
  
  painManagement: (patientName: string, painLevel: number) => ({
    reason: `Uncontrolled pain - level ${painLevel}/10`,
    severity: painLevel >= 8 ? "high" as const : "medium" as const,
    urgency: painLevel >= 8 ? "urgent" as const : "routine" as const,
    instructions: "Review pain management protocol"
  })
};

export default useEscalation;