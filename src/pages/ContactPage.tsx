import { useState } from 'react';
import { Mail, Instagram, Facebook, Twitter } from 'lucide-react';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      alert('Thank you for contacting us! We will respond within 24-48 hours.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Your full name"
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="your.email@example.com"
              />

              <Input
                label="Subject"
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                placeholder="What is this regarding?"
              />

              <Textarea
                label="Message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                placeholder="Tell us how we can help you..."
                rows={6}
              />

              <Button type="submit" fullWidth disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-neutral-900 mb-6">
                Contact Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Mail className="text-neutral-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium text-neutral-900">Email</p>
                    <a
                      href="mailto:hello@inaarawoman.com"
                      className="text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      hello@inaarawoman.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-2xl font-semibold text-neutral-900 mb-6">
                Follow Us
              </h3>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 border border-neutral-300 rounded-full hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 border border-neutral-300 rounded-full hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 border border-neutral-300 rounded-full hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all"
                >
                  <Twitter size={20} />
                </a>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-rose-50 p-8 rounded-sm">
              <h4 className="font-serif text-xl font-semibold text-neutral-900 mb-3">
                Customer Support
              </h4>
              <p className="text-neutral-700 mb-4">
                Our team is available Monday to Friday, 9 AM - 6 PM EST. We typically respond within 24-48 hours.
              </p>
              <p className="text-sm text-neutral-600">
                For order inquiries, please include your order number in your message.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
