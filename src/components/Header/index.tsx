import Link from 'next/link';
import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header(): JSX.Element {
  // TODO
  return (
    <header className={styles.headerContainer}>
      <div className={`${styles.headerContent} ${commonStyles.container}`}>
        <Link href="/">
          <img src="/images/logo.svg" alt="logo" />
        </Link>
      </div>
    </header>
  );
}
