import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
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
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  return (
    <>
      <div className={commonStyles.contentContainer}>
        <Head>
          <title>
            {post.data.title} | Spacetravelling
          </title>
        </Head>
        <Header />
      </div>
        <main>
          <div className={styles.banner}>
            <img src={post.data.banner.url} alt="banner" />
          </div>
          <article className={styles.post}>
            <h1>{post.data.title}</h1>
            <div className={commonStyles.icons}>
              <p>
                <span><FiCalendar /></span>
                {format(new Date(new Date(post.first_publication_date)),
                'dd MMM yyyy', {locale: ptBR})}
              </p>
              <p>
                <span><FiUser /></span>
                {post.data.author}
              </p>
              <p>
                <span><FiClock /></span>
                {Math.ceil(
                post.data.content.reduce((totalContent, item) => {
                  return (
                    totalContent +
                    item.body.reduce((total, paragraph) => {
                      return total + paragraph.text.split(' ').length;
                    }, 0)
                  );
                }, 0) / 200
              )}{' '}
              min
              </p>
            </div>
            { post.data.content.map(content => (
              <div className={styles.postContent} key={`${content.heading}, ${Date.now()}`}>
                <h2>{content.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body)}}
                />
              </div>
            ))}
          </article>
        </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ]);

  return {
    paths: posts.results.map(post => {
      return {
        params: { slug: post.uid }
      };
    }),
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content
    }
  }

  return {
    props: {
      post
    }
  }
};
