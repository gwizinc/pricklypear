
import React from "react";
import ChatContainer from "@/components/ChatContainer";

const Index = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Echo Chamber Chat</h1>
      <ChatContainer user1="Alice" user2="Bob" />
    </div>
  );
};

export default Index;
