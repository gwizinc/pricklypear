
import React from "react";
import DemoContainer from "@/components/DemoContainer";

const Demo = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">Nest Demo</h1>
      <p className="text-muted-foreground text-center mb-6">
        A safe place for parenting communication.
        <span className="block text-sm italic mt-1">
          (Demo messages are ephemeral and will be lost on refresh or navigation)
        </span>
      </p>
      <DemoContainer user1="Alice" user2="Bob" />
    </div>
  );
};

export default Demo;
