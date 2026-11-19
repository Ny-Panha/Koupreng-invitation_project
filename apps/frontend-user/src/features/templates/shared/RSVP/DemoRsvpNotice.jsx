// Renderer-only forms have no guest authority. Real submissions are owned by children.
export default function DemoRsvpNotice({ completed = false }) {
  return <p role={completed ? 'status' : undefined} style={{ fontSize: '0.875rem', lineHeight: 1.8, marginBlock: '1rem' }}>
    {completed
      ? 'ការសាកល្បងប៉ុណ្ណោះ។ មិនបានផ្ញើទៅម្ចាស់កម្មវិធីទេ។ / Demo response only. Nothing has been sent to the host.'
      : 'គំរូបង្ហាញប៉ុណ្ណោះ។ ការឆ្លើយតបមិនត្រូវបានផ្ញើទេ។ / Demo only. Responses are not sent to the host. Use your personal invitation to RSVP.'}
  </p>;
}
