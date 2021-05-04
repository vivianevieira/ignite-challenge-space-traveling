import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
// import { RichText } from 'prismic-reactjs';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
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
}

export default function Post({ post }: PostProps) {
  console.log(post)
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>
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
      {router.isFallback ? (
        <div>Loading...</div>
      ) : (
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
                4 min
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
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author']
  });

  return {
    paths: [{ params: { slug: 'the-jamstack-in-2021' } }, { params: { slug: 'incrementally-adopting-next.js' } }],
    fallback: true
  }
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});
  console.log(response.data.content)

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
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
