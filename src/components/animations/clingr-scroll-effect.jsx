import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export default function ClingrScrollEffect() {
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState(1);
  const sectionsRef = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '-100px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Hero Section with Parallax */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-50 to-blue-50"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        />
        <div className="relative z-10 text-center px-4">
          <h1 
            className="text-6xl md:text-8xl font-bold text-gray-900 mb-6"
            style={{
              transform: `translateY(${scrollY * 0.3}px)`,
              opacity: 1 - scrollY / 500
            }}
          >
            Clingr
          </h1>
          <p 
            className="text-xl md:text-2xl text-gray-700 mb-8"
            style={{
              transform: `translateY(${scrollY * 0.4}px)`,
              opacity: 1 - scrollY / 500
            }}
          >
            Инновационный фиксатор для фена, позволяющий освободить обе руки
          </p>
          <div 
            className="animate-bounce"
            style={{
              opacity: 1 - scrollY / 300
            }}
          >
            <ChevronDown className="w-8 h-8 mx-auto text-gray-600" />
          </div>
        </div>
      </section>

      {/* Feature Section 1 - Fade In */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="fade-in">
            <div className="text-sm text-gray-500 mb-4">01 / 03</div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Для любой поверхности
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              На любой поверхности. В любом месте: дома, в спортклубе или где-либо еще. 
              Просто закрепите Clingr и сделайте прическу как в салоне, сохранив 
              естественную красоту волос.
            </p>
          </div>
          <div className="fade-in delay-200">
            <div className="aspect-square bg-gradient-to-br from-pink-200 to-purple-200 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500">
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                [Product Image]
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2 - Slide In */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="slide-in-left order-2 md:order-1">
            <div className="aspect-square bg-gradient-to-br from-blue-200 to-purple-200 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500">
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                [Product Image]
              </div>
            </div>
          </div>
          <div className="slide-in-right order-1 md:order-2">
            <div className="text-sm text-gray-500 mb-4">02 / 03</div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Суши, расчесывай и укладывай волосы — одновременно!
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Теперь вы можете делать укладку пока волосы сушатся. Одной рукой собирайте 
              прядь, другой — расчесывайте. Выпрямляйте или закручивайте волосы одновременно 
              с сушкой, чтобы легко создать желанный образ.
            </p>
          </div>
        </div>
      </section>

      {/* Sticky Section with Scroll Progress */}
      <section className="relative min-h-[200vh]">
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-sm text-gray-500 mb-4">03 / 03</div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                10 минут вместо 40
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Укладывайте длинные волосы как профессионал каждый день. Свободные от фена 
                руки дают вам возможность контролировать волосы лучше, чем это делал бы 
                мастер в салоне красоты.
              </p>
              <div className="bg-pink-100 p-6 rounded-2xl">
                <div className="text-5xl font-bold text-pink-600 mb-2">40 → 10</div>
                <div className="text-gray-700">минут экономии времени</div>
              </div>
            </div>
            <div 
              className="transform transition-all duration-1000"
              style={{
                transform: `scale(${1 + (scrollY - 2000) / 2000}) rotate(${(scrollY - 2000) / 50}deg)`,
                opacity: Math.min(1, Math.max(0, (scrollY - 1800) / 400))
              }}
            >
              <div className="aspect-square bg-gradient-to-br from-purple-200 to-pink-200 rounded-3xl shadow-2xl">
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  [Product Image]
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid with Staggered Animation */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16 fade-in">
            Красота не требует жертв
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Без высокой температуры',
                description: 'Clingr позволяет сохранить естественный блеск и упругость волос',
                delay: '0ms'
              },
              {
                title: 'Безопасное расстояние',
                description: 'Качество сушки и укладки без вреда для волос',
                delay: '200ms'
              },
              {
                title: 'Здоровые волосы',
                description: 'Температура воздуха не превышает 50°C',
                delay: '400ms'
              }
            ].map((benefit, index) => (
              <div 
                key={index}
                className="fade-in bg-gradient-to-br from-pink-50 to-purple-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500"
                style={{ transitionDelay: benefit.delay }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-700">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Use Section with Step Animation */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16 fade-in">
            Пользоваться Clingr легко и просто
          </h2>
          <div className="space-y-8">
            {[
              'Достаем Clingr из сумки',
              'Прикрепляем держатель к любой удобной поверхности',
              'Раскладываем его',
              'Вставляем и закрепляем фен',
              'Готово!'
            ].map((step, index) => (
              <div 
                key={index}
                className="slide-in-left flex items-center gap-6"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                  {index + 1}
                </div>
                <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
                  <p className="text-lg text-gray-800">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multiple Use Cases */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16 fade-in">
            Один Clingr — много возможностей
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Сушить домашних питомцев',
                description: 'В одиночку легко и быстро',
                icon: '🐕'
              },
              {
                title: 'Собирать детей',
                description: 'Экономить время и нервы',
                icon: '👶'
              },
              {
                title: 'Одной рукой',
                description: 'Для тех, кто может пользоваться только одной рукой',
                icon: '✋'
              }
            ].map((useCase, index) => (
              <div 
                key={index}
                className="fade-in text-center"
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="text-6xl mb-4">{useCase.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{useCase.title}</h3>
                <p className="text-gray-700">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500">
        <div className="max-w-4xl mx-auto text-center fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Станьте партнером
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Хотите распространять продукцию или наладить сотрудничество с Clingr?
          </p>
          <button className="bg-white text-purple-600 px-12 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-2xl">
            Напишите нам
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white text-center">
        <p className="text-gray-400">© 2024 Clingr. Все права защищены.</p>
      </footer>

      <style jsx>{`
        .fade-in {
          opacity: 0;
          transform: translateY(50px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .slide-in-left {
          opacity: 0;
          transform: translateX(-100px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .slide-in-left.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .slide-in-right {
          opacity: 0;
          transform: translateX(100px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .slide-in-right.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .delay-200 {
          transition-delay: 200ms;
        }
      `}</style>
    </div>
  );
}
