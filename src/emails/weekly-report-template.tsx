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

interface WeeklyReportEmailProps {
    userName: string;
    stats: {
        totalLeads: number;
        newLeads: number;
        contactedLeads: number;
        clients: number;
        byStatus: {
            NEW: number;
            CONTACTED: number;
            INTERESTED: number;
            CLIENT: number;
        };
        upcomingDeadlines: Array<{
            name: string;
            estimatedCloseDate: string;
            daysUntilClose: number;
        }>;
    };
    appUrl: string;
}

export default function WeeklyReportEmail({ userName, stats, appUrl }: WeeklyReportEmailProps) {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Text style={heading}>📊 Reporte Semanal</Text>
                        <Text style={subheading}>Resumen de tu actividad</Text>
                    </Section>

                    <Section style={content}>
                        <Text style={paragraph}>
                            Hola <strong>{userName}</strong>,
                        </Text>
                        <Text style={paragraph}>
                            Aquí está tu resumen de la semana:
                        </Text>

                        {/* Overview Stats */}
                        <Section style={statsGrid}>
                            <Section style={statCard}>
                                <Text style={statNumber}>{stats.totalLeads}</Text>
                                <Text style={statLabel}>Total Leads</Text>
                            </Section>
                            <Section style={statCard}>
                                <Text style={statNumber}>+{stats.newLeads}</Text>
                                <Text style={statLabel}>Nuevos</Text>
                            </Section>
                            <Section style={statCard}>
                                <Text style={statNumber}>{stats.contactedLeads}</Text>
                                <Text style={statLabel}>Contactados</Text>
                            </Section>
                            <Section style={statCard}>
                                <Text style={statNumber}>{stats.clients}</Text>
                                <Text style={statLabel}>Clientes</Text>
                            </Section>
                        </Section>

                        {/* Status Breakdown */}
                        <Text style={sectionTitle}>Leads por Estado</Text>
                        <Section style={statusList}>
                            <Text style={statusItem}>🆕 Nuevos: {stats.byStatus.NEW}</Text>
                            <Text style={statusItem}>💬 Contactados: {stats.byStatus.CONTACTED}</Text>
                            <Text style={statusItem}>⭐ Interesados: {stats.byStatus.INTERESTED}</Text>
                            <Text style={statusItem}>✅ Clientes: {stats.byStatus.CLIENT}</Text>
                        </Section>

                        {/* Upcoming Deadlines */}
                        {stats.upcomingDeadlines.length > 0 && (
                            <>
                                <Text style={sectionTitle}>⏰ Próximos Cierres</Text>
                                {stats.upcomingDeadlines.map((deadline, index) => (
                                    <Section key={index} style={leadCard}>
                                        <Text style={leadName}>{deadline.name}</Text>
                                        <Text style={leadInfo}>
                                            Cierre estimado: {deadline.estimatedCloseDate}
                                            ({deadline.daysUntilClose} días)
                                        </Text>
                                    </Section>
                                ))}
                            </>
                        )}

                        <Button style={button} href={`${appUrl}/leads`}>
                            Ver Dashboard
                        </Button>

                        <Hr style={hr} />

                        <Text style={footer}>
                            Recibes este reporte cada semana. Puedes desactivarlo desde configuración.
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
    textAlign: 'center' as const,
};

const heading = {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0',
    color: '#1f2937',
};

const subheading = {
    fontSize: '16px',
    margin: '8px 0 0 0',
    color: '#6b7280',
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

const statsGrid = {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    margin: '24px 0',
};

const statCard = {
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center' as const,
};

const statNumber = {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0',
    color: '#2563eb',
};

const statLabel = {
    fontSize: '14px',
    margin: '4px 0 0 0',
    color: '#6b7280',
};

const sectionTitle = {
    fontSize: '18px',
    fontWeight: '600',
    margin: '32px 0 16px 0',
    color: '#1f2937',
};

const statusList = {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '16px',
};

const statusItem = {
    fontSize: '14px',
    margin: '8px 0',
    color: '#374151',
};

const leadCard = {
    backgroundColor: '#fef3c7',
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
    marginTop: '32px',
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
    textAlign: 'center' as const,
};
