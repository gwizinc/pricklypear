
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="container py-12 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-4 text-center">Nest</h1>
      <p className="text-xl text-muted-foreground text-center mb-8 max-w-2xl">
        A safe place for parenting communication. Making co-parenting conversations kinder and more productive.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Button asChild size="lg" className="px-8">
          <Link to="/demo">Try the Demo</Link>
        </Button>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
        <FeatureCard 
          title="AI Message Review" 
          description="Get suggestions on how to rephrase your messages to be more constructive and collaborative."
        />
        <FeatureCard 
          title="Clear Communication" 
          description="Reduce misunderstandings and conflicts with clearer, kinder messaging."
        />
        <FeatureCard 
          title="Secure Conversations" 
          description="A private and secure environment for sensitive co-parenting discussions."
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ title, description }: { title: string; description: string }) => (
  <div className="border rounded-lg p-6 transition-all hover:shadow-md">
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Home;
