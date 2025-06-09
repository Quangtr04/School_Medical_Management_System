import React from "react";
import { Header } from "../components/Header";
import { AboutSection } from "../components/AboutSection";
import { DocumentsSection } from "../components/DocumentSection";
import { BlogSection } from "../components/BlogSection";
import { Footer } from "../components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header></Header>
      <AboutSection></AboutSection>
      <DocumentsSection />
      <BlogSection />
      <Footer />
    </div>
  );
}
