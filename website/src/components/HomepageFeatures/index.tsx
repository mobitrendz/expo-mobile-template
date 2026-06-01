import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  emoji: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Authentication',
    emoji: '🔐',
    description: (
      <>
        JWT sign-in and sign-up with session restore from AsyncStorage. Only{' '}
        <code>user</code> role accounts are allowed.
      </>
    ),
  },
  {
    title: 'Task management',
    emoji: '✅',
    description: (
      <>
        Full CRUD for todos with priority, status, due dates, pull-to-refresh, and
        platform-aware date pickers on iOS and Android.
      </>
    ),
  },
  {
    title: 'Type-safe API',
    emoji: '⚡',
    description: (
      <>
        OpenAPI-generated client via <code>@hey-api/openapi-ts</code>, wired to your
        FastAPI backend with automatic <code>/api/v1</code> prefixing.
      </>
    ),
  },
];

function Feature({title, emoji, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <span className={styles.featureEmoji} role="img" aria-hidden>
          {emoji}
        </span>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
