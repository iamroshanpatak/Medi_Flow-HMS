// frontend/app/chat/page.tsx
'use client';

import React from 'react';
import AdvancedChatBot from '@/components/health/AdvancedChatBot';

export default function ChatPage() {
  return (
    <div className="h-screen overflow-hidden">
      <AdvancedChatBot />
    </div>
  );
}
