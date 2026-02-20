import { Target, Users, Award, TrendingUp, MapPin, Building2 } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { Header } from "./Header";
import Footer from "./Footer";

const stats = [
  {
    icon: Users,
    number: "10,000+",
    label: "Students Placed",
    description: "Across top companies"
  },
  {
    icon: Building2,
    number: "500+",
    label: "Partner Companies",
    description: "From startups to enterprises"
  },
  {
    icon: MapPin,
    number: "25+",
    label: "Cities Covered",
    description: "Growing nationwide"
  },
  {
    icon: Award,
    number: "95%",
    label: "Success Rate",
    description: "In job placements"
  }
];

const mission = [
  {
    icon: Target,
    title: "Our Mission",
    description: "To bridge the gap between talented students and the growing tech industry, creating opportunities for career growth and professional development."
  },
  {
    icon: TrendingUp,
    title: "Our Vision",
    description: "To become the leading platform for connecting professionals with opportunities, empowering careers and transforming the recruitment landscape."
  }
];

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-6">
            About CareerSphere
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            CareerSphere is the leading platform dedicated to connecting talented individuals with career opportunities in the rapidly growing technology sector.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-lg text-gray-600">Making a difference in the tech ecosystem</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 text-center border-gray-200">
                <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="font-semibold text-gray-900 mb-1">{stat.label}</div>
                <p className="text-sm text-gray-600">{stat.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {mission.map((item, index) => (
              <Card key={index} className="p-8 border-gray-200">
                <div className="bg-blue-600 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 text-lg">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Nepal's Tech Ecosystem */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Growing Tech Scene</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The technology sector is experiencing unprecedented growth, with innovative companies 
              leading the way in creating world-class solutions and opportunities for professionals worldwide.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-2">$2B+</div>
                <p className="text-gray-700">Industry Revenue</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-2">50,000+</div>
                <p className="text-gray-700">IT Professionals</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-2">200+</div>
                <p className="text-gray-700">Tech Companies</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Join the Tech Revolution
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Be part of the transformation shaping the digital future
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100"
            onClick={() => navigate("/applicant/signup")}
          >
            Get Started Today
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}