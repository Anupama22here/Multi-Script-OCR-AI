import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PenTool, 
  Camera, 
  Scroll, 
  Languages, 
  ArrowRight
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const features = [
    {
      icon: PenTool,
      title: 'Handwritten OCR',
      description: 'Convert handwritten Tamil text to digital format with high accuracy',
      link: '/handwritten'
    },
    {
      icon: Camera,
      title: 'Natural Scenes OCR',
      description: 'Extract text from street signs, documents, and real-world images',
      link: '/natural'
    },
    {
      icon: Scroll,
      title: 'Brahmi Script OCR',
      description: 'Recognize ancient Brahmi scripts using our custom trained model',
      link: '/brahmi'
    },
    {
      icon: Languages,
      title: 'Script Transcription',
      description: 'Transliterate between different ancient scripts and scripts',
      link: '/transcribe'
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hero-title">
              OCR
              <span className="gradient-text"> Handwritten, Scenes & Brahmi Scripts</span>
            </h1>
            <p className="hero-description">
              Advanced Optical Character Recognition for Tamil text with support for handwritten documents, 
              natural scenes, and ancient Brahmi scripts. Convert images to text with professional accuracy.
            </p>
            <div className="hero-actions">
              <Link to="/handwritten" className="btn btn-primary">
                Get Started
                <ArrowRight size={20} />
              </Link>
              <Link to="/how-to-use" className="btn btn-outline">
                Learn More
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            className="hero-illustration"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="illustration-card">
              <div className="document-icon">
                <Scroll size={80} />
              </div>
              <div className="floating-elements">
                <div className="floating-icon pen">
                  <PenTool size={24} />
                </div>
                <div className="floating-icon camera">
                  <Camera size={24} />
                </div>
                <div className="floating-icon languages">
                  <Languages size={24} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">OCR Capabilities</h2>
            <p className="section-description">
              Choose the right OCR mode for your specific needs
            </p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="feature-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="feature-icon">
                    <Icon size={32} />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                  <Link to={feature.link} className="feature-link">
                    Try Now <ArrowRight size={16} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-description">
              Upload your first image and experience the power of OCR
            </p>
            <div className="cta-actions">
              <Link to="/handwritten" className="btn btn-primary">
                Start with Handwritten OCR
                <ArrowRight size={20} />
              </Link>
              <Link to="/transcribe" className="btn btn-outline">
                Try Script Transcription
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
