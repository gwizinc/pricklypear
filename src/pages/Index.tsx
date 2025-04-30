
import React from "react";
import ChatContainer from "@/components/ChatContainer";

const Index = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">Nest</h1>
      <p className="text-muted-foreground text-center mb-6">A safe place for parenting communication.</p>
      <ChatContainer user1="Alice" user2="Bob" />
    </div>
  );
};

export default Index;
