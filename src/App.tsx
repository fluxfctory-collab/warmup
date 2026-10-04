import { Header } from './sections/Header';
import { Hero } from './sections/Hero';
import { ProductIntro } from './sections/ProductIntro';
import { Details } from './sections/Details';
import { Construction } from './sections/Construction';
import { Clinical } from './sections/Clinical';
import { Research } from './sections/Research';
import { Faq } from './sections/Faq';
import { Contact } from './sections/Contact';
import { Footer } from './sections/Footer';
import { useScrollReveal } from './components/useScrollReveal';

export function App() {
  useScrollReveal();
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <ProductIntro />
        <Details />
        <Construction />
        <Clinical />
        <Research />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
