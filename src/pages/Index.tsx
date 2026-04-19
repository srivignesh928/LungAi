import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Shield, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import lungHero from "@/assets/lung-hero.png";
import CustomCursor from "@/components/CustomCursor";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Detection",
      description: "Advanced deep learning models trained on thousands of chest X-rays for accurate pneumonia detection"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get comprehensive analysis results in seconds with detailed confidence scores"
    },
    {
      icon: Shield,
      title: "Clinical Grade",
      description: "Built with healthcare standards in mind, ensuring reliability and precision"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero relative">
      <CustomCursor />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Lung Disease Detection
              </span>
              <br />
              <span className="text-foreground">Made Intelligent</span>
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Harness the power of deep learning to detect Lung Diseases from chest X-rays with remarkable accuracy. 
              Our AI model provides fast, reliable analysis to support medical professionals in early diagnosis.
            </p>

            <div className="flex gap-4">
              <Button 
                size="lg"
                className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-all duration-300 shadow-glow group"
                onClick={() => navigate("/predict")}
              >
                Start Analysis
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="hover:bg-primary/10 transition-all duration-300"
                onClick={() => navigate("/analysis")}
              >
                View Reports
              </Button>
            </div>
          </div>

          <div className="relative animate-float">
            <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full"></div>
            <img 
              src={lungHero} 
              alt="Lung AI Visualization" 
              className="relative z-10 w-full h-auto rounded-2xl shadow-glow"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Why Choose LungAI?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cutting-edge technology meets healthcare expertise
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-2 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 shadow-soft">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 text-center bg-gradient-secondary shadow-glow animate-slide-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Experience the future of medical imaging analysis with our state-of-the-art AI platform
          </p>
          <Button 
            size="lg"
            className="bg-background text-foreground hover:bg-background/90 shadow-soft"
            onClick={() => navigate("/predict")}
          >
            Upload X-Ray Now
          </Button>
        </Card>
        </section>
      </div>
    </div>
  );
};

export default Index;
