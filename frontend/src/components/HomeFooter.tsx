import Slider from 'react-slick';

import ReactLogo from '../assets/react.svg';
import TailwindLogo from '../assets/tailwind.svg';
const Logos = [
  {
    src: ReactLogo,
    name: 'React',
    alt: 'React',
  },
  {
    src: 'https://nestjs.com/logo-small-gradient.d792062c.svg',
    name: 'NestJS',
    alt: 'NestJS',
  },
  {
    src: 'https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png',
    name: 'Github',
    alt: 'Github',
  },
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg',
    name: 'TypeScript',
    alt: 'TypeScript',
  },
  {
    src: TailwindLogo,
    name: 'TailwindCSS',
    alt: 'TailwindCSS',
  },
  {
    src: 'https://vite.dev/logo.svg',
    name: 'Vite',
    alt: 'Vite',
  },
  {
    src: 'https://supabase.com/dashboard/img/supabase-logo.svg',
    name: 'Supabase',
    alt: 'Supabase',
  },
];

const HomeFooter: React.FC = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    responsive: [
      {
        breakpoint: 768, 
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
    ],
  };
  

  return (
    <div className="flex flex-col justify-center items-center h-auto w-full mt-[-200px] max-w-[90%] md:max-w-[50%] mx-auto">
        <p className="text-sm mb-10 font-semibold text-gray-300">
          Technology used to build this app
        </p>
      <Slider {...settings} className="w-full">
        {Logos.map((logo) => (
          <div key={logo.name} className="flex justify-center items-center">
            <img 
              src={logo.src} 
              alt={logo.name} 
              title={logo.name}
              className="h-12 w-12 mx-auto filter grayscale" 
            />
          </div>
        ))}
      </Slider>

    </div>
  );
};

export default HomeFooter;
