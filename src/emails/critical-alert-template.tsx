import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Button,
    Hr,
} from '@react-email/components';

interface CriticalAlertEmailProps {
    userName: string;
    lead: {
        name: string;
        urgencyLevel?: string;
        estimatedCloseDate?: string;
        nextActionDate?: string;
        reason: string;
    };
    appUrl: string;
    leadId: string;
}

export default function CriticalAlertEmail({ userName, lead, appUrl, leadId }: CriticalAlertEmailProps) {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Text style={heading}>🚨 Alerta Crítica</Text>
                    </Section>

                    <Section style={content}>
                        <Text style={paragraph}>
                            Hola <strong>{userName}</strong>,
                        </Text>
                        <Text style={paragraph}>
                            Tienes un lead que requiere atención inmediata:
                        </Text>

                        <Section style={alertCard}>
                            <Text style={leadName}>📋 {lead.name}</Text>
                            <Text style={alertReason}>
                                <strong>Motivo:</strong> {lead.reason}
                            </Text>

                            {lead.urgencyLevel && (
                                <Text style={leadDetail}>
                                    <strong>Urgencia:</strong> {lead.urgencyLevel === 'HIGH' ? '🔴 Alta' : lead.urgencyLevel}
                                </Text>
                            )}

                            {lead.estimatedCloseDate && (
                                <Text style={leadDetail}>
                                    <strong>Fecha de cierre:</strong> {lead.estimatedCloseDate}
                                </Text>
                            )}

                            {lead.nextActionDate && (
                                <Text style={leadDetail}>
                                    <strong>Próxima acción:</strong> {lead.nextActionDate}
                                </Text>
                            )}
                        </Section>

                        <Button style={button} href={`${appUrl}/leads/${leadId}`}>
                            Ver Lead Ahora
                        </Button>

                        <Hr style={hr} />

                        <Text style={footer}>
                            Recibes estas alertas porque están habilitadas en tu configuración.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    maxWidth: '600px',
};

const header = {
    padding: '32px 24px',
    backgroundColor: '#fee2e2',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
};

const heading = {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0',
    color: '#991b1b',
};

const content = {
    padding: '24px',
};

const paragraph = {
    fontSize: '16px',
    lineHeight: '24px',
    margin: '16px 0',
    color: '#374151',
};

const alertCard = {
    backgroundColor: '#fef2f2',
    border: '2px solid #fca5a5',
    borderRadius: '8px',
    padding: '20px',
    marginTop: '16px',
};

const leadName = {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 12px 0',
    color: '#1f2937',
};

const alertReason = {
    fontSize: '15px',
    margin: '8px 0',
    padding: '12px',
    backgroundColor: '#fee2e2',
    borderRadius: '6px',
    color: '#991b1b',
};

const leadDetail = {
    fontSize: '14px',
    margin: '8px 0',
    color: '#6b7280',
};

const button = {
    backgroundColor: '#dc2626',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    width: '100%',
    padding: '12px',
    marginTop: '24px',
};

const hr = {
    borderColor: '#e5e7eb',
    margin: '32px 0',
};

const footer = {
    color: '#6b7280',
    fontSize: '12px',
    lineHeight: '16px',
    margin: '0',
};
