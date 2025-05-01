
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, Lock, CircleCheck } from "lucide-react";

const Home = () => {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section with Wave Background */}
      <div className="w-full bg-warm-DEFAULT py-20 px-4 wave-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-rounded text-primary mb-6">
            A safe place for parenting communication
          </h1>
          <p className="text-xl text-primary max-w-2xl mx-auto mb-10">
            Making co-parenting conversations kinder and more productive.
          </p>
        </div>
      </div>
      
      {/* Feature Cards */}
      <div className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <FeatureCard 
            title="AI Message Review" 
            icon={<MessageSquareIcon />}
            description="Get suggestions on how to rephrase your messages to be more constructive and collaborative."
          />
          <FeatureCard 
            title="Clear Communication" 
            icon={<CactusIcon />}
            description="Reduce misunderstandings and conflicts with clearer, kinder messaging."
          />
          <FeatureCard 
            title="Secure Conversations" 
            icon={<LockIcon />}
            description="A private and secure environment for sensitive co-parenting discussions."
          />
        </div>
        
        <div className="mt-12 text-center">
          <Button asChild className="bg-accent hover:bg-accent/90 hover-rotate text-lg px-8 py-6 h-auto">
            <Link to="/threads">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, icon, description }: { title: string; icon: React.ReactNode; description: string }) => (
  <div className="bg-white rounded-xl p-8 shadow-card hover:bg-bgLight transition-all hover-tilt">
    <div className="flex justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold font-rounded mb-4 text-primary text-center">{title}</h3>
    <p className="text-textBody text-center">{description}</p>
  </div>
);

// Custom Icon Components that match the screenshot
const MessageSquareIcon = () => (
  <div className="w-12 h-12 text-accent flex items-center justify-center">
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 15H20C17.2386 15 15 17.2386 15 20V35C15 37.7614 17.2386 40 20 40H25V45L35 40H40C42.7614 40 45 37.7614 45 35V20C45 17.2386 42.7614 15 40 15Z" 
        stroke="#B5674D" 
        strokeWidth="4" 
        fill="none"
        strokeLinecap="round" 
        strokeLinejoin="round" />
      <path d="M23 25H37" stroke="#B5674D" strokeWidth="4" strokeLinecap="round" />
      <path d="M23 32H30" stroke="#B5674D" strokeWidth="4" strokeLinecap="round" />
    </svg>
  </div>
);

const CactusIcon = () => (
  <div className="w-12 h-12 text-secondary flex items-center justify-center">
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 15V45" stroke="#97BFB4" strokeWidth="4" strokeLinecap="round" />
      <path d="M30 25C30 22.2386 32.2386 20 35 20H37.5C40.2614 20 42.5 22.2386 42.5 25V45H30" 
        stroke="#97BFB4" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" />
      <path d="M30 35C30 32.2386 27.7614 30 25 30H22.5C19.7386 30 17.5 32.2386 17.5 35V45H30" 
        stroke="#97BFB4" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" />
      <path d="M15 45H45" stroke="#97BFB4" strokeWidth="4" strokeLinecap="round" />
    </svg>
  </div>
);

const LockIcon = () => (
  <div className="w-12 h-12 text-secondary flex items-center justify-center">
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="25" width="30" height="25" rx="4" stroke="#97BFB4" strokeWidth="4" fill="none" />
      <path d="M20 25V20C20 14.4772 24.4772 10 30 10C35.5228 10 40 14.4772 40 20V25" 
        stroke="#97BFB4" 
        strokeWidth="4" 
        strokeLinecap="round" />
      <path d="M30 35V40" stroke="#97BFB4" strokeWidth="4" strokeLinecap="round" />
    </svg>
  </div>
);

export default Home;
