import { Picture } from '../components/Picture';
import { images } from '../content/images';
import { alts, captions, intro } from '../content/product';
import styles from './ProductIntro.module.css';

export function ProductIntro() {
  return (
    <section id="product" className={styles.section} aria-labelledby="product-title">
      <div className={`container ${styles.grid}`}>
        <figure className={styles.figure}>
          <Picture
            image={images.wristSeam}
            alt={alts.wristSeam}
            sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1279px) 40vw, 460px"
            imgClassName={styles.img}
          />
          <figcaption className={styles.caption}>{captions.wristSeam}</figcaption>
        </figure>
        <div className={styles.copy}>
          <h2 id="product-title">{intro.title}</h2>
          <div className={styles.text}>
            {intro.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <p className={styles.context}>
            {intro.context}{' '}
            <a href="#research">See the research it draws on.</a>
          </p>
        </div>
      </div>
    </section>
  );
}
