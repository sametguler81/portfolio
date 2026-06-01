"use client";
import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export const HeroParallax = ({
  products,
}: {
  products: {
    title: string;
    link: string;
    thumbnail: string;
  }[];
}) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const xVal = isMobile ? 300 : 1000;
  const xRevVal = isMobile ? -300 : -1000;
  const yStartVal = isMobile ? -150 : -700;
  const yEndVal = isMobile ? 150 : 500;
  const rxVal = isMobile ? 5 : 15;
  const rzVal = isMobile ? 5 : 20;

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, xVal]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, xRevVal]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [rxVal, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [rzVal, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [yStartVal, yEndVal]),
    springConfig
  );

  // On mobile, the tilted 3-row parallax looks cramped → show a clean grid instead.
  if (isMobile) {
    return (
      <div ref={ref} className="overflow-hidden antialiased relative flex flex-col">
        <Header />
        <div className="px-4 -mt-10 grid grid-cols-2 gap-3 max-w-7xl mx-auto w-full pb-10">
          {products.map((product) => (
            <Link
              key={product.title}
              href={product.link}
              className="group relative block aspect-[4/3] rounded-xl overflow-hidden border border-white/10"
            >
              <Image
                src={product.thumbnail}
                fill
                sizes="50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                alt={product.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <span className="absolute bottom-2 left-2 right-2 text-white font-mono text-[11px] font-semibold leading-tight">
                {product.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d] h-[300vh] py-40"
    >
      <Header />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
      >
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-8 md:space-x-20 mb-8 md:mb-20">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row mb-8 md:mb-20 space-x-8 md:space-x-20">
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-8 md:space-x-20">
          {thirdRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export const Header = () => {
  return (
    <div className="max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full left-0 top-0">
      <h2 className="text-2xl md:text-7xl font-bold dark:text-white serif">
        Seçili İşler
      </h2>
      <p className="max-w-2xl text-base md:text-xl mt-8 dark:text-neutral-200">
        Web panellerinden mobil uygulamalara, kurumsal ERP çözümlerinden IoT otomasyonlarına kadar geliştirdiğim projelerden seçkiler.
      </p>
    </div>
  );
};

export const ProductCard = ({
  product,
  translate,
}: {
  product: {
    title: string;
    link: string;
    thumbnail: string;
  };
  translate: MotionValue<number>;
}) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -20,
      }}
      key={product.title}
      className="group/product h-56 w-[16rem] md:h-96 md:w-[30rem] relative flex-shrink-0"
    >
      <Link
        href={product.link}
        className="block group-hover/product:shadow-2xl "
      >
        <Image
          src={product.thumbnail}
          height="600"
          width="600"
          className="object-cover object-left-top absolute h-full w-full inset-0"
          alt={product.title}
        />
      </Link>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-black pointer-events-none"></div>
      <h2 className="absolute bottom-4 left-4 opacity-0 group-hover/product:opacity-100 text-white mono text-xs md:text-sm font-semibold">
        {product.title}
      </h2>
    </motion.div>
  );
};
