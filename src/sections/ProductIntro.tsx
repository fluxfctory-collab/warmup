import { Picture } from '../components/Picture';
import { images } from '../content/images';
import { alts, captions, intro } from '../content/product';
import styles from './ProductIntro.module.css';

export function ProductIntro() {
  return (
    <section id="product" className={styles.section} aria-labelledby="product-title">
      <div className={`container ${styles.grid}`}>
        <figure className={styles.figure} data-reveal>
          <div className={styles.frame}>
            <Picture
              image={images.wristSeam}
              alt={alts.wristSeam}
              sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1279px) 42vw, 486px"
              imgClassName={styles.img}
            />
          </div>
          <figcaption className={styles.caption}>{captions.wristSeam}</figcaption>
        </figure>
        <div className={styles.copy} data-reveal>
          <h2 id="product-title">{intro.title}</h2>
          <dl className={styles.points}>
            {intro.points.map((p) => (
              <div key={p.label} className={styles.point}>
                <dt>{p.label}</dt>
                <dd>{p.text}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.context}>
            {intro.context} <a href="#research">See the research it draws on.</a>
          </p>
        </div>
      </div>
    </section>
  );
}
