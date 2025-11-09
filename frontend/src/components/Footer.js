import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Github, 
  Mail, 
  Twitter, 
  Linkedin, 
  Scroll
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    'OCR Tools': [
      { name: 'Handwritten OCR', path: '/handwritten' },
      { name: 'Natural Scenes OCR', path: '/natural' },
      { name: 'Brahmi Script OCR', path: '/brahmi' },
      { name: 'Script Transcription', path: '/transcribe' }
    ],
    'Resources': [
      { name: 'How to Use', path: '/how-to-use' },
      { name: 'FAQ', path: '/faq' },
      { name: 'API Documentation', path: '/api-docs' },
      { name: 'GitHub Repository', path: 'https://github.com/your-username/tamil-ocr' }
    ],
    'Support': [
      { name: 'Contact Us', path: 'mailto:support@tamilocr.com' },
      { name: 'Report Issue', path: 'https://github.com/your-username/tamil-ocr/issues' },
      { name: 'Feature Request', path: 'https://github.com/your-username/tamil-ocr/discussions' },
      { name: 'Privacy Policy', path: '/privacy' }
    ]
  };

  const socialLinks = [
    { icon: Github, url: 'https://github.com/your-username', label: 'GitHub' },
    { icon: Twitter, url: 'https://twitter.com/your-username', label: 'Twitter' },
    { icon: Linkedin, url: 'https://linkedin.com/in/your-username', label: 'LinkedIn' },
    { icon: Mail, url: 'mailto:contact@tamilocr.com', label: 'Email' }
  ];

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="container">
          <div className="footer-main">
            {/* Brand Section */}
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <div className="logo-icon">
                  <Scroll size={28} />
                </div>
                <span className="logo-text">OCR</span>
              </Link>
              <p className="footer-description">
                Advanced Tamil Optical Character Recognition with support for handwritten text, 
                natural scenes, and ancient Brahmi scripts. Built with cutting-edge AI technology.
              </p>
              <div className="social-links">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.url}
                      className="social-link"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                    >
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Links Sections */}
            <div className="footer-links">
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category} className="footer-column">
                  <h3 className="footer-column-title">{category}</h3>
                  <ul className="footer-column-links">
                    {links.map((link, index) => (
                      <li key={index}>
                        {link.path.startsWith('http') || link.path.startsWith('mailto:') ? (
                          <a
                            href={link.path}
                            target={link.path.startsWith('http') ? '_blank' : '_self'}
                            rel={link.path.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="footer-link"
                          >
                            {link.name}
                          </a>
                        ) : (
                          <Link to={link.path} className="footer-link">
                            {link.name}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Credits Section */}
          <div className="footer-credits">
            <div className="credits-copyright">
              <p>&copy; {currentYear} OCR. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
