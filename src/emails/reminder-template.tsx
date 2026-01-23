import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Link,
    Button,
    Hr,
} from '@react-email/components';

interface ReminderEmailProps {
    userName: string;
    leads: Array<{
        name: string;
        lastContactDate: string | null;
        daysSinceContact: number;
    }>;
    appUrl: string;
}

export default function ReminderEmail({ userName, leads, appUrl }: ReminderEmailProps) {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Text style={heading}>🔔 Recordatorio de Seguimiento</Text>
                    </Section>

                    <Section style={content}>
                        <Text style={paragraph}>
                            Hola <strong>{userName}</strong>,
                        </Text>
                        <Text style={paragraph}>
                            Tienes <strong>{leads.length}</strong> lead{leads.length > 1 ? 's' : ''} que
                            {leads.length > 1 ? ' requieren' : ' requiere'} seguimiento:
                        </Text>

                        {leads.map((lead, index) => (
                            <Section key={index} style={leadCard}>
                                <Text style={leadName}>📋 {lead.name}</Text>
                                <Text style={leadInfo}>
                                    {lead.lastContactDate
                                        ? `Último contacto: hace ${lead.daysSinceContact} días`
                                        : 'Sin contacto registrado'}
                                </Text>
                            </Section>
                        ))}

                        <Button style={button} href={`${appUrl}/leads`}>
                            Ver mis Leads
                        </Button>

                        <Hr style={hr} />

                        <Text style={footer}>
                            Puedes desactivar estos recordatorios desde la{' '}
                            <Link href={`${appUrl}/settings`} style={link}>
                                configuración de tu cuenta
                            </Link>
                            .
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
};

const heading = {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0',
    color: '#1f2937',
};

const content = {
    padding: '0 24px',
};

const paragraph = {
    fontSize: '16px',
    lineHeight: '24px',
    margin: '16px 0',
    color: '#374151',
};

const leadCard = {
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
};

const leadName = {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    color: '#1f2937',
};

const leadInfo = {
    fontSize: '14px',
    margin: '0',
    color: '#6b7280',
};

const button = {
    backgroundColor: '#2563eb',
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

const link = {
    color: '#2563eb',
    textDecoration: 'underline',
};
