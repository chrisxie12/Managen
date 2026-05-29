export type InboxMessage = {
  id: string;
  message_id: string;
  recipient_id: string;
  status: string;
  read_at?: string;
  message: {
    id: string;
    subject: string;
    body: string;
    channel: string;
    sender_id?: string;
    status: string;
    created_at: string;
    sent_at?: string;
  };
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  status: string;
  created_at: string;
  created_by?: string;
};
