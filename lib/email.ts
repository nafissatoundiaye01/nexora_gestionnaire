import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface MeetingEmailData {
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  organizerName: string;
}

interface SendMeetingInviteParams {
  to: string;
  recipientName: string;
  meeting: MeetingEmailData;
  isOrganizer?: boolean;
}

export async function sendMeetingInvite({ to, recipientName, meeting, isOrganizer = false }: SendMeetingInviteParams) {
  const formattedDate = new Date(meeting.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const headerTitle = isOrganizer ? 'Confirmation de réunion' : 'Invitation à une réunion';
  const introMessage = isOrganizer
    ? 'Votre réunion a été programmée avec succès.'
    : `<strong>${meeting.organizerName}</strong> vous invite à participer à une réunion.`;

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                    ${headerTitle}
                  </h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                    Bonjour <strong>${recipientName}</strong>,
                  </p>

                  <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                    ${introMessage}
                  </p>

                  <!-- Meeting Card -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 24px;">
                        <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 20px; font-weight: 600;">
                          ${meeting.title}
                        </h2>

                        ${meeting.description ? `
                        <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                          ${meeting.description}
                        </p>
                        ` : ''}

                        <!-- Date -->
                        <table cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                          <tr>
                            <td style="width: 32px; vertical-align: top;">
                              <div style="width: 24px; height: 24px; background-color: #6366f1; border-radius: 6px; display: inline-block; text-align: center; line-height: 24px;">
                                <span style="color: #ffffff; font-size: 12px;">📅</span>
                              </div>
                            </td>
                            <td style="color: #374151; font-size: 14px; padding-left: 8px;">
                              <strong>Date :</strong> ${formattedDate}
                            </td>
                          </tr>
                        </table>

                        <!-- Time -->
                        <table cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                          <tr>
                            <td style="width: 32px; vertical-align: top;">
                              <div style="width: 24px; height: 24px; background-color: #6366f1; border-radius: 6px; display: inline-block; text-align: center; line-height: 24px;">
                                <span style="color: #ffffff; font-size: 12px;">🕐</span>
                              </div>
                            </td>
                            <td style="color: #374151; font-size: 14px; padding-left: 8px;">
                              <strong>Horaire :</strong> ${meeting.startTime} - ${meeting.endTime}
                            </td>
                          </tr>
                        </table>

                        ${meeting.location ? `
                        <!-- Location -->
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width: 32px; vertical-align: top;">
                              <div style="width: 24px; height: 24px; background-color: #6366f1; border-radius: 6px; display: inline-block; text-align: center; line-height: 24px;">
                                <span style="color: #ffffff; font-size: 12px;">📍</span>
                              </div>
                            </td>
                            <td style="color: #374151; font-size: 14px; padding-left: 8px;">
                              <strong>Lieu :</strong> ${meeting.location.startsWith('http') ? `<a href="${meeting.location}" style="color: #6366f1;">${meeting.location}</a>` : meeting.location}
                            </td>
                          </tr>
                        </table>
                        ` : ''}
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Connectez-vous à Nexora Agenda pour consulter tous les détails et gérer vos réunions.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    Cet email a été envoyé automatiquement par Nexora Agenda.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const introTextMessage = isOrganizer
    ? 'Votre réunion a été programmée avec succès.'
    : `${meeting.organizerName} vous invite à participer à une réunion.`;

  const emailText = `
Bonjour ${recipientName},

${introTextMessage}

${meeting.title}
${meeting.description ? `\n${meeting.description}\n` : ''}
Date : ${formattedDate}
Horaire : ${meeting.startTime} - ${meeting.endTime}
${meeting.location ? `Lieu : ${meeting.location}` : ''}

Connectez-vous à Nexora Agenda pour consulter tous les détails.
  `.trim();

  const subjectPrefix = isOrganizer ? 'Confirmation' : 'Invitation';

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Nexora Agenda <noreply@resend.dev>',
      to: [to],
      subject: `${subjectPrefix} : ${meeting.title} - ${formattedDate}`,
      html: emailHtml,
      text: emailText,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendMeetingInvites(
  emails: { to: string; recipientName: string; isOrganizer?: boolean }[],
  meeting: MeetingEmailData
) {
  const results = await Promise.allSettled(
    emails.map(({ to, recipientName, isOrganizer }) =>
      sendMeetingInvite({ to, recipientName, meeting, isOrganizer })
    )
  );

  const successful = results.filter(
    (r): r is PromiseFulfilledResult<{ success: true; messageId: string }> =>
      r.status === 'fulfilled' && r.value.success
  ).length;

  const failed = results.length - successful;

  return { successful, failed, total: results.length };
}
