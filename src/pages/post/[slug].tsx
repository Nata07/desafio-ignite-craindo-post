/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';
import { useMemo } from 'react';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import PostComments from '../../components/PostComments';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
  before: {
    uid: string;
    title: string;
  };
  after: {
    uid: string;
    title: string;
  };
}

export default function Post({
  post,
  preview,
  before,
  after,
}: PostProps): JSX.Element {
  // TODO
  const updatedDateTime = useMemo(() => {
    return format(
      new Date(post.first_publication_date),
      "'* editado em 'dd MMM yyyy', às ' HH:mm ",
      {
        locale: ptBR,
      }
    );
  }, [post.last_publication_date]);
  const router = useRouter();
  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  const totalWords = post.data.content.reduce((accumulator, content) => {
    accumulator += content.heading.split(' ').length;
    const words = content.body.map(item => item.text.split(' ').length);
    words.map(word => (accumulator += word));
    return accumulator;
  }, 0);
  const readingTime = Math.ceil(totalWords / 200);

  return (
    <>
      <Head>
        <title> {post.data.title} | NS Post </title>
      </Head>
      <Header />
      <section className={styles.bannerContainer}>
        <img src={post.data.banner.url} alt={post.data.title} />
      </section>
      <main className={commonStyles.container}>
        <h1 className={styles.title}>{post.data.title}</h1>
        <section className={styles.metaData}>
          <div>
            <FiCalendar />
            <span>
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </span>
          </div>
          <div>
            <FiUser />
            <span>{post.data.author}</span>
          </div>
          <div>
            <FiClock />
            <span>{readingTime} min</span>
          </div>
        </section>
        <section className={styles.updatedMetaData}>
          <span>{updatedDateTime}</span>
        </section>
        <section className={styles.content}>
          {post.data.content.map(content => (
            <div className={styles.postSection} key={content.heading}>
              <h1>{content.heading}</h1>
              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </div>
          ))}
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'post')
  );
  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));
  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const afterPosts = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    { orderings: '[document.first_publication_date]', after: response.id }
  );
  const beforePosts = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    { orderings: '[document.first_publication_date desc]', after: response.id }
  );
  const after = {
    uid: afterPosts.results_size > 0 ? afterPosts.results[0].uid : '',
    title: afterPosts.results_size > 0 ? afterPosts.results[0].data.title : '',
  };
  const before = {
    uid: beforePosts.results_size > 0 ? beforePosts.results[0].uid : '',
    title:
      beforePosts.results_size > 0 ? beforePosts.results[0].data.title : '',
  };
  return { props: { post: response, preview, before, after } };
};
