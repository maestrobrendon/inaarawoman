import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function AboutPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <section className="relative h-[60vh] flex items-center justify-center bg-gradient-to-br from-amber-50 to-rose-50">
        <div className="text-center px-4 max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
            Our Story
          </h1>
          <p className="text-lg text-neutral-700 leading-relaxed">
            Where timeless elegance meets the radiance of modern femininity
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-neutral-700 leading-relaxed mb-6">
              <span className="font-serif text-2xl font-semibold text-neutral-900 block mb-4">
                Every woman deserves to shine in her own light.
              </span>
              At Inaara Woman, we believe that true beauty lies in embracing who you are. Our name,
              "Inaara," means "ray of light" in Arabic—a reflection of our mission to help every
              woman illuminate her unique radiance through timeless, elegant fashion.
            </p>

            <p className="text-neutral-700 leading-relaxed mb-6">
              Founded with a vision to bridge cultural depth with contemporary style, we create pieces
              that celebrate the modern woman in all her forms. Each garment is thoughtfully designed
              to embody grace, confidence, and versatility—allowing you to move through your day with
              effortless elegance.
            </p>

            <p className="text-neutral-700 leading-relaxed mb-6">
              Our collections are inspired by the stories of women around the world—women who balance
              tradition with modernity, who honor their heritage while embracing the future. We understand
              that fashion is more than clothing; it's a form of self-expression, a celebration of
              identity, and a connection to something larger than ourselves.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-center text-neutral-900 mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="font-serif text-xl font-semibold mb-3 text-neutral-900">
                Timeless Elegance
              </h3>
              <p className="text-neutral-700">
                We create pieces that transcend trends, designed to be cherished for years to come.
              </p>
            </div>
            <div className="text-center p-8">
              <div className="text-5xl mb-4">🌟</div>
              <h3 className="font-serif text-xl font-semibold mb-3 text-neutral-900">
                Quality Craftsmanship
              </h3>
              <p className="text-neutral-700">
                Every garment is crafted with meticulous attention to detail using premium materials.
              </p>
            </div>
            <div className="text-center p-8">
              <div className="text-5xl mb-4">💫</div>
              <h3 className="font-serif text-xl font-semibold mb-3 text-neutral-900">
                Celebrate Individuality
              </h3>
              <p className="text-neutral-700">
                We honor the unique beauty and story of every woman who wears our designs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold text-neutral-900 mb-6">
            Join Our Journey
          </h2>
          <p className="text-lg text-neutral-700 mb-8 leading-relaxed">
            Discover pieces that resonate with your soul and celebrate your light.
            We're honored to be part of your story.
          </p>
          <Button size="lg" onClick={() => navigate('/shop')}>
            Explore Our Collection
          </Button>
        </div>
      </section>
    </div>
  );
}
