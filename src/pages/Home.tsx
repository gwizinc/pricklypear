import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, Lock, CircleCheck } from "lucide-react";
import SubscriptionPlans from "@/components/SubscriptionPlans";

const Home = () => {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section with Background Image */}
      <div className="relative w-full min-h-[65vh] bg-[url('../public/jumbo.png')] bg-center bg-cover bg-no-repeat">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/15"></div>

        {/* Content */}
        <div className="relative container mx-auto max-w-4xl text-center py-20 px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-rounded text-white mb-6">
            AI-assisted parenting communication.
          </h1>
          <p className="text-xl text-white max-w-2xl mx-auto mb-10">
            Co-parenting can be{" "}
            <i>
              <b>prickly</b>
            </i>
            . Use AI to help keep it friendly.
          </p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <FeatureCard
            title="AI Message Review"
            icon={<CircleCheck size={48} className="text-warm-DEFAULT" />}
            description="Get suggestions on how to rephrase your messages to be more constructive and collaborative."
          />
          <FeatureCard
            title="Clear Communication"
            icon={<MessageSquare size={48} className="text-accent-DEFAULT" />}
            description="Reduce misunderstandings and conflicts with clearer, kinder messaging."
          />
          <FeatureCard
            title="Secure Conversations"
            icon={<Lock size={48} className="text-secondary-DEFAULT" />}
            description="A private and secure environment for sensitive co-parenting discussions."
          />
        </div>

        <div className="mt-12 text-center">
          <Button
            asChild
            className="bg-secondary hover:bg-secondary/90 hover-rotate text-lg px-8 py-6 h-auto"
          >
            <Link to="/threads">Get Started</Link>
          </Button>
        </div>
      </div>

      {/* Subscription / Pricing Section */}
      <SubscriptionPlans />
    </div>
  );
};

const FeatureCard = ({
  title,
  icon,
  description,
}: {
  title: string;
  icon: React.ReactNode;
  description: string;
}) => (
  <div className="bg-white rounded-xl p-8 shadow-card hover:bg-bgLight transition-all hover-tilt">
    <div className="flex justify-center mb-6">{icon}</div>
    <h3 className="text-xl font-bold font-rounded mb-4 text-primary text-center">
      {title}
    </h3>
    <p className="text-textBody text-center">{description}</p>
  </div>
);

export default Home;
